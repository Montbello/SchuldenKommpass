import { useState, useEffect } from 'react';

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
}

interface UserProgressDetail {
  user: InstitutionUser;
  progresses: Array<{
    progress_id: string;
    task: { title: string };
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
  }>;
  documents: Array<{
    document_id: string;
    document_category: string;
    verification_status: string | null;
    uploaded_at: string;
  }>;
}

export default function InstitutionDashboard() {
  const [users, setUsers] = useState<InstitutionUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    onboarding_status: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.onboarding_status) params.append('onboarding_status', filters.onboarding_status);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/institutions/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Fehler beim Laden der Nutzer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Institutionen-Dashboard</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Suche</label>
            <input
              type="text"
              placeholder="Name oder E-Mail"
              className="w-full px-3 py-2 border rounded-md"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Alle</option>
              <option value="ACTIVE">Aktiv</option>
              <option value="INACTIVE">Inaktiv</option>
              <option value="SUSPENDED">Gesperrt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Onboarding-Status</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.onboarding_status}
              onChange={(e) => setFilters({ ...filters, onboarding_status: e.target.value })}
            >
              <option value="">Alle</option>
              <option value="NOT_STARTED">Nicht begonnen</option>
              <option value="IN_PROGRESS">In Bearbeitung</option>
              <option value="PENDING_REVIEW">Prüfung ausstehend</option>
              <option value="APPROVED">Genehmigt</option>
              <option value="REJECTED">Abgelehnt</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <UserTable users={users} loading={loading} onSelectUser={setSelectedUser} />

      {/* User Progress Detail Modal */}
      {selectedUser && (
        <UserProgressDetailModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

function UserTable({
  users,
  loading,
  onSelectUser,
}: {
  users: InstitutionUser[];
  loading: boolean;
  onSelectUser: (userId: string) => void;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Lädt...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Keine Nutzer gefunden</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">E-Mail</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Onboarding</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Level</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Punkte</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Stabilität</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map(user => (
            <tr key={user.user_id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{user.name || '-'}</td>
              <td className="px-4 py-3 text-sm">{user.email}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3">
                <OnboardingBadge status={user.onboarding_status} />
              </td>
              <td className="px-4 py-3 text-center">{user.level}</td>
              <td className="px-4 py-3 text-center">{user.total_points}</td>
              <td className="px-4 py-3 text-center">
                {user.stability_score ? user.stability_score.toFixed(1) : '-'}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onSelectUser(user.user_id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
}

function OnboardingBadge({ status }: { status: string }) {
  const colors = {
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colors[status as keyof typeof colors]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function UserProgressDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData] = useState<UserProgressDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'certificates' | 'documents'>('overview');

  useEffect(() => {
    fetchProgressDetail();
  }, [userId]);

  const fetchProgressDetail = async () => {
    try {
      const response = await fetch(`/api/institutions/users/${userId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Fehler beim Laden der Details:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const periodEnd = new Date().toISOString().split('T')[0];

      const response = await fetch(
        `/api/institutions/users/${userId}/report/pdf?period_start=${periodStart}&period_end=${periodEnd}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${userId}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Fehler beim Download:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold">
            {data?.user.name || data?.user.email || 'Nutzer-Details'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              PDF Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Schließen
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Lädt...</p>
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">Fehler beim Laden der Daten</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b px-6">
              {['overview', 'progress', 'certificates', 'documents'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab === 'overview' && 'Übersicht'}
                  {tab === 'progress' && `Fortschritte (${data.progresses.length})`}
                  {tab === 'certificates' && `Zertifikate (${data.certificates.length})`}
                  {tab === 'documents' && `Dokumente (${data.documents.length})`}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold">{data.user.status}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Onboarding</p>
                      <p className="font-semibold">{data.user.onboarding_status}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Level</p>
                      <p className="font-semibold">{data.user.level}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Gesammelte Punkte</p>
                      <p className="font-semibold">{data.user.total_points}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Stabilitätsscore</p>
                      <p className="font-semibold">
                        {data.user.stability_score?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Registriert am</p>
                      <p className="font-semibold">
                        {new Date(data.user.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="space-y-3">
                  {data.progresses.map(prog => (
                    <div key={prog.progress_id} className="border rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{prog.task.title}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(prog.updated_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={prog.status} />
                          {prog.points_earned && (
                            <p className="text-sm text-gray-600 mt-1">
                              +{prog.points_earned} Punkte
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="grid grid-cols-2 gap-4">
                  {data.certificates.map(cert => (
                    <div key={cert.certificate_id} className="border rounded p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🏅</span>
                        <div>
                          <h4 className="font-semibold">{cert.title}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(cert.issued_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-3">
                  {data.documents.map(doc => (
                    <div key={doc.document_id} className="border rounded p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{doc.document_category}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      {doc.verification_status && (
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          doc.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                          doc.verification_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {doc.verification_status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
