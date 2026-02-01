import { useState, useEffect } from 'react';

interface Appointment {
  appointment_id: string;
  start_time: string;
  end_time: string;
  status: string;
  video_link?: string;
  advisor?: {
    name: string;
  };
}

export default function AppointmentCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Fehler beim Laden der Termine:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);

  const getAppointmentsForDay = (day: number) => {
    const dateStr = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    ).toISOString().split('T')[0];

    return appointments.filter(apt => 
      apt.start_time.startsWith(dateStr)
    );
  };

  const changeMonth = (direction: number) => {
    setSelectedDate(new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + direction,
      1
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Terminkalender</h2>
        <button
          onClick={() => setShowBookingModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Neuer Termin
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => changeMonth(-1)}
          className="px-3 py-1 border rounded hover:bg-gray-50"
        >
          ← Zurück
        </button>
        <h3 className="text-xl font-semibold">
          {selectedDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="px-3 py-1 border rounded hover:bg-gray-50"
        >
          Weiter →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-100 border-b">
          {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
            <div key={day} className="p-3 text-center font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="p-3 border bg-gray-50 min-h-24"></div>
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = 
              day === new Date().getDate() &&
              selectedDate.getMonth() === new Date().getMonth() &&
              selectedDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`p-3 border min-h-24 hover:bg-gray-50 cursor-pointer ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayAppointments.map(apt => (
                    <div
                      key={apt.appointment_id}
                      className="text-xs p-1 bg-blue-100 rounded cursor-pointer hover:bg-blue-200"
                      title={apt.advisor?.name || 'Termin'}
                    >
                      {new Date(apt.start_time).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Anstehende Termine</h3>
        {loading ? (
          <p className="text-gray-500">Lädt...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500">Keine Termine vorhanden</p>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map(apt => (
              <AppointmentCard key={apt.appointment_id} appointment={apt} />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal onClose={() => setShowBookingModal(false)} onBooked={fetchAppointments} />
      )}
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const [showVideoFrame, setShowVideoFrame] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
        <div>
          <div className="font-medium">
            {new Date(appointment.start_time).toLocaleDateString('de-DE', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
          <div className="text-sm text-gray-600">
            {new Date(appointment.start_time).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}{' '}
            - {new Date(appointment.end_time).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          {appointment.advisor && (
            <div className="text-sm text-gray-500">Mit: {appointment.advisor.name}</div>
          )}
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs ${
            appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
            appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {appointment.status}
          </span>
          {appointment.video_link && (
            <button
              onClick={() => setShowVideoFrame(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Video beitreten
            </button>
          )}
        </div>
      </div>

      {showVideoFrame && appointment.video_link && (
        <VideoCallFrame
          videoLink={appointment.video_link}
          onClose={() => setShowVideoFrame(false)}
        />
      )}
    </>
  );
}

function BookingModal({ onClose, onBooked }: { onClose: () => void; onBooked: () => void }) {
  const [formData, setFormData] = useState({
    advisorId: '',
    date: '',
    time: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          advisorId: formData.advisorId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'PENDING',
        }),
      });

      if (response.ok) {
        onBooked();
        onClose();
      }
    } catch (error) {
      console.error('Fehler beim Buchen:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Termin buchen</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Berater</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={formData.advisorId}
              onChange={(e) => setFormData({ ...formData, advisorId: e.target.value })}
              required
            >
              <option value="">Berater auswählen</option>
              {/* TODO: Load advisors from API */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Datum</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Uhrzeit</label>
            <input
              type="time"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Buchen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VideoCallFrame({ videoLink, onClose }: { videoLink: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="w-full h-full max-w-6xl max-h-screen p-4">
        <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Video-Beratung</h3>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Beenden
            </button>
          </div>
          <iframe
            src={videoLink}
            className="flex-1 w-full"
            allow="camera; microphone; fullscreen; display-capture"
          />
        </div>
      </div>
    </div>
  );
}
