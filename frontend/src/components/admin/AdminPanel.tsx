import { useState, useEffect } from 'react';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_tasks: number;
  total_progress: number;
  pending_verifications: number;
}

interface User {
  user_id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  onboarding_status: string;
  created_at: string;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/users', { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-gray-500">Lädt Admin-Panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          Administrator
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['overview', 'users', 'tasks', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'overview' && 'Übersicht'}
            {tab === 'users' && 'Benutzer'}
            {tab === 'tasks' && 'Aufgaben'}
            {tab === 'reports' && 'Berichte'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Gesamt Benutzer" value={stats.total_users} icon="👥" color="bg-blue-500" />
            <StatCard title="Aktive Benutzer" value={stats.active_users} icon="✅" color="bg-green-500" />
            <StatCard title="Aufgaben" value={stats.total_tasks} icon="📋" color="bg-purple-500" />
            <StatCard title="Fortschritte" value={stats.total_progress} icon="📈" color="bg-yellow-500" />
            <StatCard title="Offene Prüfungen" value={stats.pending_verifications} icon="⏳" color="bg-red-500" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Letzte Aktivitäten</h2>
            <p className="text-gray-500">Aktivitätsfeed wird geladen...</p>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Benutzer suchen..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">E-Mail</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Rolle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Onboarding</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Erstellt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{user.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.onboarding_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      user.onboarding_status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.onboarding_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Aufgaben-Verwaltung</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Neue Aufgabe erstellen
            </button>
          </div>
          <p className="text-gray-500">Aufgaben-Verwaltung wird geladen...</p>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Berichte & Analysen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportCard
              title="Benutzer-Bericht"
              description="Vollständiger Überblick über alle Benutzer"
              action="Generieren"
            />
            <ReportCard
              title="Fortschritts-Bericht"
              description="Analyse der Nutzerfortschritte"
              action="Generieren"
            />
            <ReportCard
              title="Aufgaben-Statistiken"
              description="Übersicht aller Aufgaben und deren Status"
              action="Generieren"
            />
            <ReportCard
              title="Onboarding-Analyse"
              description="Onboarding-Erfolgsraten und Abbrüche"
              action="Generieren"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white text-2xl mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function ReportCard({ title, description, action }: { title: string; description: string; action: string }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {action}
      </button>
    </div>
  );
}
