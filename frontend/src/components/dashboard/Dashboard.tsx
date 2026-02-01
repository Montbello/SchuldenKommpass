import { useState, useEffect } from 'react';

interface DashboardStats {
  level: number;
  total_points: number;
  onboarding_status: string;
  active_tasks: number;
  completed_tasks: number;
  upcoming_appointments: number;
  certificates_count: number;
}

interface RecentActivity {
  id: string;
  type: 'task' | 'certificate' | 'appointment' | 'progress';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/users/me/stats', { headers }),
        fetch('/api/users/me/activity', { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (activityRes.ok) setRecentActivity(await activityRes.json());
    } catch (error) {
      console.error('Dashboard Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Lädt Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Willkommen zurück! 👋</h1>
        <p className="text-gray-600 mt-1">Hier ist deine Übersicht</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dein Level"
          value={stats?.level || 1}
          subtitle={`${stats?.total_points || 0} Punkte`}
          icon="🏆"
          color="bg-gradient-to-br from-yellow-400 to-yellow-600"
        />
        <StatCard
          title="Aktive Aufgaben"
          value={stats?.active_tasks || 0}
          subtitle={`${stats?.completed_tasks || 0} abgeschlossen`}
          icon="📋"
          color="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard
          title="Termine"
          value={stats?.upcoming_appointments || 0}
          subtitle="Anstehend"
          icon="📅"
          color="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard
          title="Zertifikate"
          value={stats?.certificates_count || 0}
          subtitle="Erreicht"
          icon="🏅"
          color="bg-gradient-to-br from-purple-400 to-purple-600"
        />
      </div>

      {/* Onboarding Status Banner */}
      {stats?.onboarding_status !== 'APPROVED' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-800">Onboarding noch nicht abgeschlossen</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Status: {stats?.onboarding_status} - Schließe dein Onboarding ab, um alle Features freizuschalten.
              </p>
            </div>
            <button className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
              Fortsetzen
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Letzte Aktivitäten</h2>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Noch keine Aktivitäten</p>
                <p className="text-sm text-gray-400 mt-2">Starte mit einer Aufgabe!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
            <div className="space-y-2">
              <QuickActionButton
                icon="📋"
                label="Aufgaben durchsuchen"
                href="/tasks"
              />
              <QuickActionButton
                icon="📅"
                label="Termin buchen"
                href="/appointments"
              />
              <QuickActionButton
                icon="📈"
                label="Mein Fortschritt"
                href="/progress"
              />
              <QuickActionButton
                icon="🏅"
                label="Meine Zertifikate"
                href="/certificates"
              />
              <QuickActionButton
                icon="👤"
                label="Profil bearbeiten"
                href="/profile"
              />
            </div>
          </div>

          {/* Progress Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <h2 className="text-xl font-semibold mb-4">Dein Fortschritt</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Onboarding</span>
                  <span className="font-medium">
                    {stats?.onboarding_status === 'APPROVED' ? '100%' : '60%'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: stats?.onboarding_status === 'APPROVED' ? '100%' : '60%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Profil-Vollständigkeit</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`${color} text-white p-4`}>
        <div className="flex items-center justify-between">
          <span className="text-3xl">{icon}</span>
          <span className="text-3xl font-bold">{value}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const typeColors = {
    task: 'bg-blue-100 text-blue-800',
    certificate: 'bg-yellow-100 text-yellow-800',
    appointment: 'bg-green-100 text-green-800',
    progress: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[activity.type]}`}>
        <span className="text-lg">{activity.icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{activity.title}</h4>
        <p className="text-sm text-gray-600">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(activity.timestamp).toLocaleString('de-DE')}
        </p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-gray-400">→</span>
    </a>
  );
}
