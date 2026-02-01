import { useState, useEffect } from 'react';
import type { User } from '../../types';
import { handleApiResponse } from '../../api/client';

interface InstitutionDashboardProps {
  user: User;
}

interface InstitutionUser {
  user_id: string;
  name: string | null;
  email: string;
  status: string;
  onboarding_status: string;
  stability_score: number | null;
  level: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

interface UserProgress {
  user_id: string;
  name: string | null;
  email: string;
  level: number;
  total_points: number;
  onboarding_status: string;
  stability_score: number | null;
  progresses: Array<{
    progress_id: string;
    task: { title: string; description: string | null };
    status: string;
    points_earned: number | null;
    updated_at: string;
  }>;
  certificates: Array<{
    certificate_id: string;
    title: string;
    issued_date: string;
  }>;
  appointments: Array<{
    appointment_id: string;
    start_time: string;
    status: string;
    advisor: { name: string | null } | null;
  }>;
  documents: Array<{
    document_id: string;
    document_category: string;
    verification_status: string | null;
    uploaded_at: string;
  }>;
}

interface Statistics {
  total_users: number;
  onboarding_completed: number;
  average_level: number;
  total_points: number;
  status_distribution: Record<string, number>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export default function InstitutionDashboard({ user }: InstitutionDashboardProps) {
  const [users, setUsers] = useState<InstitutionUser[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [onboardingFilter, setOnboardingFilter] = useState('');

  const institutionId = (user as any).institution_id || user.user_id;

  useEffect(() => {
    loadData();
  }, [institutionId, pagination.page, statusFilter, onboardingFilter]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter) params.append('status', statusFilter);
      if (onboardingFilter) params.append('onboarding_status', onboardingFilter);
      if (searchTerm) params.append('search', searchTerm);

      const [usersRes, statsRes] = await Promise.all([
        fetch(`/api/institutions/users?${params}`, { credentials: 'include' }),
        fetch(`/api/institutions/statistics`, { credentials: 'include' }),
      ]);

      const usersData = await handleApiResponse<{ users: InstitutionUser[]; pagination: Pagination }>(usersRes);
      const statsData = await handleApiResponse<Statistics>(statsRes);

      setUsers(usersData.users);
      setPagination(usersData.pagination);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  async function loadUserDetails(userId: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/institutions/users/${userId}/progress`, { credentials: 'include' });
      const data = await handleApiResponse<UserProgress>(res);
      setSelectedUser(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Details');
    } finally {
      setDetailLoading(false);
    }
  }

  async function downloadReport(userId: string) {
    try {
      const res = await fetch(`/api/institutions/reports/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Download fehlgeschlagen');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${userId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadData();
  }

  const statusColors: Record<string, string> = {
    NOT_STARTED: '#9ca3af',
    IN_PROGRESS: '#f59e0b',
    PENDING_REVIEW: '#6366f1',
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
  };

  if (loading && users.length === 0) {
    return <div className="loading">Dashboard wird geladen...</div>;
  }

  return (
    <div className="institution-dashboard">
      <h1>🏛️ Institutionen-Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total_users}</span>
            <span className="stat-label">Betreute Nutzer</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.onboarding_completed}</span>
            <span className="stat-label">Onboarding abgeschlossen</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.average_level.toFixed(1)}</span>
            <span className="stat-label">Ø Level</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_points}</span>
            <span className="stat-label">Gesamtpunkte</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Name oder E-Mail suchen..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        <select value={onboardingFilter} onChange={e => { setOnboardingFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Alle Status</option>
          <option value="NOT_STARTED">Nicht gestartet</option>
          <option value="IN_PROGRESS">In Bearbeitung</option>
          <option value="PENDING_REVIEW">Prüfung ausstehend</option>
          <option value="APPROVED">Genehmigt</option>
          <option value="REJECTED">Abgelehnt</option>
        </select>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Alle Nutzer</option>
          <option value="ACTIVE">Aktiv</option>
          <option value="INACTIVE">Inaktiv</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Level</th>
              <th>Punkte</th>
              <th>Stabilität</th>
              <th>Registriert</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td>
                  <div className="user-cell">
                    <strong>{u.name || 'Unbekannt'}</strong>
                    <small>{u.email}</small>
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{ background: statusColors[u.onboarding_status] || '#9ca3af' }}>
                    {u.onboarding_status.replace('_', ' ')}
                  </span>
                </td>
                <td>{u.level}</td>
                <td>{u.total_points}</td>
                <td>{u.stability_score?.toFixed(1) || '-'}</td>
                <td>{new Date(u.created_at).toLocaleDateString('de-DE')}</td>
                <td className="actions">
                  <button className="btn-action" onClick={() => loadUserDetails(u.user_id)}>📋 Details</button>
                  <button className="btn-action" onClick={() => downloadReport(u.user_id)}>📄 PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="no-results">Keine Nutzer gefunden.</div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="pagination">
          <button disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
            ← Zurück
          </button>
          <span>Seite {pagination.page} von {pagination.total_pages}</span>
          <button disabled={pagination.page === pagination.total_pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
            Weiter →
          </button>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedUser.name || selectedUser.email}</h2>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            {detailLoading ? (
              <div className="loading">Laden...</div>
            ) : (
              <div className="detail-content">
                {/* User Info */}
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Level</span>
                    <span className="value">{selectedUser.level}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Punkte</span>
                    <span className="value">{selectedUser.total_points}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status</span>
                    <span className="value">{selectedUser.onboarding_status}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Stabilität</span>
                    <span className="value">{selectedUser.stability_score?.toFixed(1) || '-'}</span>
                  </div>
                </div>

                {/* Progress */}
                <section>
                  <h3>Fortschritte ({selectedUser.progresses.length})</h3>
                  {selectedUser.progresses.length === 0 ? (
                    <p className="empty">Keine Fortschritte</p>
                  ) : (
                    <ul className="detail-list">
                      {selectedUser.progresses.slice(0, 5).map(p => (
                        <li key={p.progress_id}>
                          <strong>{p.task.title}</strong>
                          <span className={`status ${p.status}`}>{p.status}</span>
                          {p.points_earned && <span className="points">+{p.points_earned} Pkt</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Certificates */}
                <section>
                  <h3>Zertifikate ({selectedUser.certificates.length})</h3>
                  {selectedUser.certificates.length === 0 ? (
                    <p className="empty">Keine Zertifikate</p>
                  ) : (
                    <ul className="detail-list">
                      {selectedUser.certificates.map(c => (
                        <li key={c.certificate_id}>
                          <strong>{c.title}</strong>
                          <span className="date">{new Date(c.issued_date).toLocaleDateString('de-DE')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Appointments */}
                <section>
                  <h3>Termine ({selectedUser.appointments.length})</h3>
                  {selectedUser.appointments.length === 0 ? (
                    <p className="empty">Keine Termine</p>
                  ) : (
                    <ul className="detail-list">
                      {selectedUser.appointments.slice(0, 5).map(a => (
                        <li key={a.appointment_id}>
                          <span>{new Date(a.start_time).toLocaleString('de-DE')}</span>
                          <span className={`status ${a.status}`}>{a.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Documents */}
                <section>
                  <h3>Dokumente ({selectedUser.documents.length})</h3>
                  {selectedUser.documents.length === 0 ? (
                    <p className="empty">Keine Dokumente</p>
                  ) : (
                    <ul className="detail-list">
                      {selectedUser.documents.map(d => (
                        <li key={d.document_id}>
                          <strong>{d.document_category}</strong>
                          <span className={`status ${d.verification_status || 'pending'}`}>
                            {d.verification_status || 'Ausstehend'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => downloadReport(selectedUser.user_id)}>
                    📄 PDF-Report herunterladen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .institution-dashboard { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .alert-error { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
        .stat-value { display: block; font-size: 2rem; font-weight: 700; color: #6366f1; }
        .stat-label { color: #6b7280; font-size: 0.875rem; }
        .filters { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .search-form { display: flex; flex: 1; min-width: 200px; }
        .search-form input { flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px 0 0 6px; }
        .search-form button { padding: 0.75rem 1rem; background: #6366f1; color: white; border: none; border-radius: 0 6px 6px 0; cursor: pointer; }
        .filters select { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; }
        .users-table-container { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th, .users-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .users-table th { background: #f9fafb; font-weight: 600; color: #374151; }
        .user-cell strong { display: block; }
        .user-cell small { color: #6b7280; }
        .status-badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; color: white; }
        .actions { display: flex; gap: 0.5rem; }
        .btn-action { padding: 0.5rem; background: #f3f4f6; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
        .btn-action:hover { background: #e5e7eb; }
        .no-results { padding: 2rem; text-align: center; color: #6b7280; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; }
        .pagination button { padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer; }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .detail-modal { background: white; border-radius: 12px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; background: white; }
        .modal-header h2 { margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .detail-content { padding: 1.5rem; }
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .info-item { text-align: center; padding: 1rem; background: #f9fafb; border-radius: 6px; }
        .info-item .label { display: block; font-size: 0.75rem; color: #6b7280; }
        .info-item .value { font-size: 1.25rem; font-weight: 600; }
        .detail-content section { margin-bottom: 1.5rem; }
        .detail-content h3 { font-size: 1rem; margin-bottom: 0.5rem; color: #374151; }
        .empty { color: #9ca3af; font-size: 0.875rem; }
        .detail-list { list-style: none; padding: 0; margin: 0; }
        .detail-list li { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        .detail-list .status { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; background: #f3f4f6; }
        .detail-list .status.verified, .detail-list .status.completed { background: #ecfdf5; color: #059669; }
        .detail-list .status.in_progress { background: #fef3c7; color: #d97706; }
        .detail-list .status.rejected { background: #fee2e2; color: #dc2626; }
        .detail-list .points { color: #6366f1; font-weight: 500; }
        .detail-list .date { color: #9ca3af; font-size: 0.875rem; }
        .modal-actions { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
        .btn-primary { padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%; }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .info-grid { grid-template-columns: repeat(2, 1fr); }
          .users-table { font-size: 0.875rem; }
        }
      `}</style>
    </div>
  );
}
