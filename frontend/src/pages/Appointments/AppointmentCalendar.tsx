import { useState, useEffect } from 'react';
import type { User } from '../../types';
import {
  getAppointments,
  createAppointment,
  cancelAppointment,
  generateVideoLink,
  type Appointment,
} from '../../api/appointments';

interface AppointmentCalendarProps {
  user: User;
}

type ViewMode = 'week' | 'month' | 'list';

export default function AppointmentCalendar({ user }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [user.user_id]);

  async function loadAppointments() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointments(user.user_id);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Termine');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelAppointment(appointmentId: string) {
    if (!confirm('Möchten Sie diesen Termin wirklich absagen?')) return;
    
    try {
      await cancelAppointment(appointmentId);
      setAppointments(appointments.map(a => 
        a.appointment_id === appointmentId ? { ...a, status: 'cancelled' } : a
      ));
    } catch (err: any) {
      setError(err.message || 'Fehler beim Absagen');
    }
  }

  async function handleJoinVideo(appointment: Appointment) {
    try {
      if (appointment.video_link) {
        window.open(appointment.video_link, '_blank');
      } else {
        const { video_link } = await generateVideoLink(appointment.appointment_id);
        window.open(video_link, '_blank');
        // Update local state
        setAppointments(appointments.map(a =>
          a.appointment_id === appointment.appointment_id ? { ...a, video_link } : a
        ));
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Generieren des Video-Links');
    }
  }

  async function handleBookAppointment(data: { date: string; time: string; duration: number }) {
    try {
      const start = new Date(`${data.date}T${data.time}`);
      const end = new Date(start.getTime() + data.duration * 60 * 1000);
      
      const newAppointment = await createAppointment({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'scheduled',
      });
      
      setAppointments([...appointments, newAppointment]);
      setShowBookingModal(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Buchen');
    }
  }

  const upcomingAppointments = appointments
    .filter(a => new Date(a.start_time) > new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const pastAppointments = appointments
    .filter(a => new Date(a.start_time) <= new Date() || a.status === 'cancelled')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  if (loading) {
    return <div className="loading">Termine werden geladen...</div>;
  }

  return (
    <div className="appointment-calendar">
      <div className="calendar-header">
        <h1>📅 Meine Termine</h1>
        <div className="header-actions">
          <div className="view-toggle">
            {(['list', 'week', 'month'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode === 'list' ? '📋' : mode === 'week' ? '📆' : '🗓️'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowBookingModal(true)}>
            + Termin buchen
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="appointments-list">
          {/* Upcoming */}
          <section className="appointments-section">
            <h2>Anstehende Termine ({upcomingAppointments.length})</h2>
            {upcomingAppointments.length === 0 ? (
              <p className="no-appointments">Keine anstehenden Termine.</p>
            ) : (
              <div className="appointments-grid">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.appointment_id}
                    appointment={appointment}
                    onCancel={() => handleCancelAppointment(appointment.appointment_id)}
                    onJoinVideo={() => handleJoinVideo(appointment)}
                    onView={() => setSelectedAppointment(appointment)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Past */}
          {pastAppointments.length > 0 && (
            <section className="appointments-section past">
              <h2>Vergangene Termine</h2>
              <div className="appointments-grid">
                {pastAppointments.slice(0, 5).map(appointment => (
                  <AppointmentCard
                    key={appointment.appointment_id}
                    appointment={appointment}
                    isPast
                    onView={() => setSelectedAppointment(appointment)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Week View Placeholder */}
      {viewMode === 'week' && (
        <div className="calendar-view week-view">
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            onNavigate={setCurrentDate}
            onSelectAppointment={setSelectedAppointment}
          />
        </div>
      )}

      {/* Month View Placeholder */}
      {viewMode === 'month' && (
        <div className="calendar-view month-view">
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            onNavigate={setCurrentDate}
            onSelectAppointment={setSelectedAppointment}
          />
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          onClose={() => setShowBookingModal(false)}
          onBook={handleBookAppointment}
        />
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onCancel={() => handleCancelAppointment(selectedAppointment.appointment_id)}
          onJoinVideo={() => handleJoinVideo(selectedAppointment)}
        />
      )}

      <style>{`
        .appointment-calendar {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .calendar-header h1 {
          margin: 0;
        }
        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .view-toggle {
          display: flex;
          gap: 0.25rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: 6px;
        }
        .view-btn {
          padding: 0.5rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
        }
        .view-btn.active {
          background: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: #4f46e5;
        }
        .appointments-section {
          margin-bottom: 2rem;
        }
        .appointments-section h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #374151;
        }
        .appointments-section.past {
          opacity: 0.7;
        }
        .no-appointments {
          color: #6b7280;
          text-align: center;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 8px;
        }
        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        .alert {
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }
        .alert-error {
          background: #fee2e2;
          color: #dc2626;
        }
        .calendar-view {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

// Appointment Card Component
interface AppointmentCardProps {
  appointment: Appointment;
  isPast?: boolean;
  onCancel?: () => void;
  onJoinVideo?: () => void;
  onView?: () => void;
}

function AppointmentCard({ appointment, isPast, onCancel, onJoinVideo, onView }: AppointmentCardProps) {
  const startDate = new Date(appointment.start_time);
  const endDate = new Date(appointment.end_time);
  const isToday = startDate.toDateString() === new Date().toDateString();
  const isSoon = startDate.getTime() - Date.now() < 30 * 60 * 1000; // Within 30 min

  const statusColors: Record<string, string> = {
    scheduled: '#6366f1',
    confirmed: '#10b981',
    cancelled: '#ef4444',
    completed: '#6b7280',
  };

  return (
    <div className={`appointment-card ${isPast ? 'past' : ''} ${appointment.status}`}>
      <div className="card-header">
        <span className="date">
          {isToday ? 'Heute' : startDate.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
        <span className="status" style={{ background: statusColors[appointment.status] }}>
          {appointment.status === 'scheduled' ? 'Geplant' :
           appointment.status === 'confirmed' ? 'Bestätigt' :
           appointment.status === 'cancelled' ? 'Abgesagt' : 'Abgeschlossen'}
        </span>
      </div>

      <div className="card-body">
        <div className="time">
          🕐 {startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        {appointment.advisor && (
          <div className="advisor">
            👤 Berater: {appointment.advisor.name || appointment.advisor.email}
          </div>
        )}
      </div>

      <div className="card-actions">
        {!isPast && appointment.status !== 'cancelled' && (
          <>
            {isSoon && (
              <button className="btn btn-video" onClick={onJoinVideo}>
                📹 Beitreten
              </button>
            )}
            <button className="btn btn-cancel" onClick={onCancel}>
              Absagen
            </button>
          </>
        )}
        <button className="btn btn-view" onClick={onView}>
          Details
        </button>
      </div>

      <style>{`
        .appointment-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-left: 4px solid #6366f1;
        }
        .appointment-card.past {
          opacity: 0.6;
        }
        .appointment-card.cancelled {
          border-left-color: #ef4444;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .date {
          font-weight: 600;
          color: #374151;
        }
        .status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: white;
        }
        .card-body {
          margin-bottom: 1rem;
        }
        .time {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .advisor {
          color: #6b7280;
          font-size: 0.875rem;
        }
        .card-actions {
          display: flex;
          gap: 0.5rem;
        }
        .card-actions .btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .btn-video {
          background: #10b981;
          color: white;
        }
        .btn-cancel {
          background: #fee2e2;
          color: #dc2626;
        }
        .btn-view {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>
    </div>
  );
}

// Booking Modal
interface BookingModalProps {
  onClose: () => void;
  onBook: (data: { date: string; time: string; duration: number }) => void;
}

function BookingModal({ onClose, onBook }: BookingModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const minDate = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onBook({ date, time, duration });
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Termin buchen</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Datum</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={minDate}
              required
            />
          </div>

          <div className="form-group">
            <label>Uhrzeit</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Dauer</label>
            <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
              <option value={15}>15 Minuten</option>
              <option value={30}>30 Minuten</option>
              <option value={45}>45 Minuten</option>
              <option value={60}>60 Minuten</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Abbrechen
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Wird gebucht...' : 'Termin buchen'}
            </button>
          </div>
        </form>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
          }
          .modal {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            width: 90%;
            max-width: 400px;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .modal-header h2 {
            margin: 0;
          }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
          }
          .form-group {
            margin-bottom: 1rem;
          }
          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          .form-group input,
          .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
          }
          .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
          }
          .modal-actions .btn {
            flex: 1;
            padding: 0.75rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-secondary {
            background: #f3f4f6;
          }
          .btn-primary {
            background: #6366f1;
            color: white;
          }
        `}</style>
      </div>
    </div>
  );
}

// Appointment Detail Modal
interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onCancel: () => void;
  onJoinVideo: () => void;
}

function AppointmentDetailModal({ appointment, onClose, onCancel, onJoinVideo }: AppointmentDetailModalProps) {
  const startDate = new Date(appointment.start_time);
  const endDate = new Date(appointment.end_time);
  const isUpcoming = startDate > new Date() && appointment.status !== 'cancelled';
  const isSoon = startDate.getTime() - Date.now() < 30 * 60 * 1000;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Termindetails</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="detail-content">
          <div className="detail-row">
            <span className="label">📅 Datum:</span>
            <span>{startDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="detail-row">
            <span className="label">🕐 Zeit:</span>
            <span>{startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="detail-row">
            <span className="label">📊 Status:</span>
            <span>{appointment.status}</span>
          </div>
          {appointment.advisor && (
            <div className="detail-row">
              <span className="label">👤 Berater:</span>
              <span>{appointment.advisor.name || appointment.advisor.email}</span>
            </div>
          )}
          {appointment.video_link && (
            <div className="detail-row">
              <span className="label">📹 Video:</span>
              <a href={appointment.video_link} target="_blank" rel="noopener noreferrer">Link öffnen</a>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {isUpcoming && (
            <>
              {isSoon && (
                <button className="btn btn-video" onClick={onJoinVideo}>
                  📹 Video beitreten
                </button>
              )}
              <button className="btn btn-cancel" onClick={onCancel}>
                Absagen
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
          }
          .modal {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            width: 90%;
            max-width: 450px;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
          }
          .detail-content {
            margin-bottom: 1.5rem;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row .label {
            color: #6b7280;
          }
          .modal-actions {
            display: flex;
            gap: 0.5rem;
          }
          .modal-actions .btn {
            flex: 1;
            padding: 0.75rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-video {
            background: #10b981;
            color: white;
          }
          .btn-cancel {
            background: #fee2e2;
            color: #dc2626;
          }
          .btn-secondary {
            background: #f3f4f6;
          }
        `}</style>
      </div>
    </div>
  );
}

// Simple Week View Component
interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onNavigate: (date: Date) => void;
  onSelectAppointment: (apt: Appointment) => void;
}

function WeekView({ currentDate, appointments, onNavigate, onSelectAppointment }: WeekViewProps) {
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(a => {
      const aptDate = new Date(a.start_time);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="week-view-container">
      <div className="nav-bar">
        <button onClick={() => {
          const prev = new Date(currentDate);
          prev.setDate(prev.getDate() - 7);
          onNavigate(prev);
        }}>← Vorherige</button>
        <span>{weekStart.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => {
          const next = new Date(currentDate);
          next.setDate(next.getDate() + 7);
          onNavigate(next);
        }}>Nächste →</button>
      </div>

      <div className="week-grid">
        {weekDays.map(day => (
          <div key={day.toISOString()} className={`day-column ${day.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
            <div className="day-header">
              <span className="day-name">{day.toLocaleDateString('de-DE', { weekday: 'short' })}</span>
              <span className="day-num">{day.getDate()}</span>
            </div>
            <div className="day-appointments">
              {getAppointmentsForDay(day).map(apt => (
                <div
                  key={apt.appointment_id}
                  className={`apt-block ${apt.status}`}
                  onClick={() => onSelectAppointment(apt)}
                >
                  {new Date(apt.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .week-view-container {
          min-height: 400px;
        }
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.5rem;
        }
        .nav-bar button {
          background: #f3f4f6;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }
        .day-column {
          min-height: 200px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
        }
        .day-column.today {
          border-color: #6366f1;
          background: #f5f3ff;
        }
        .day-header {
          padding: 0.5rem;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .day-name {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .day-num {
          font-weight: 600;
        }
        .day-appointments {
          padding: 0.25rem;
        }
        .apt-block {
          background: #6366f1;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
          cursor: pointer;
        }
        .apt-block.cancelled {
          background: #ef4444;
        }
      `}</style>
    </div>
  );
}

// Simple Month View Component
interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onNavigate: (date: Date) => void;
  onSelectAppointment: (apt: Appointment) => void;
}

function MonthView({ currentDate, appointments, onNavigate, onSelectAppointment }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startPadding + 1;
    if (dayNum < 1 || dayNum > totalDays) return null;
    return new Date(year, month, dayNum);
  });

  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];
    return appointments.filter(a => {
      const aptDate = new Date(a.start_time);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="month-view-container">
      <div className="nav-bar">
        <button onClick={() => onNavigate(new Date(year, month - 1, 1))}>← Vorheriger</button>
        <span>{currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => onNavigate(new Date(year, month + 1, 1))}>Nächster →</button>
      </div>

      <div className="month-grid">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
          <div key={d} className="day-header">{d}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} className={`day-cell ${day?.toDateString() === new Date().toDateString() ? 'today' : ''} ${!day ? 'empty' : ''}`}>
            {day && (
              <>
                <span className="day-num">{day.getDate()}</span>
                {getAppointmentsForDay(day).length > 0 && (
                  <div className="apt-indicator" onClick={() => getAppointmentsForDay(day).forEach(onSelectAppointment)}>
                    {getAppointmentsForDay(day).length}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .month-view-container {
          min-height: 400px;
        }
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .nav-bar button {
          background: #f3f4f6;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .month-grid .day-header {
          padding: 0.5rem;
          text-align: center;
          font-weight: 600;
          background: #f9fafb;
        }
        .day-cell {
          min-height: 60px;
          padding: 0.25rem;
          border: 1px solid #e5e7eb;
          position: relative;
        }
        .day-cell.empty {
          background: #f9fafb;
        }
        .day-cell.today {
          background: #f5f3ff;
          border-color: #6366f1;
        }
        .day-cell .day-num {
          font-size: 0.875rem;
        }
        .apt-indicator {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: #6366f1;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
