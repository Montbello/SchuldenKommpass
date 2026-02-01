import { useState, useEffect } from 'react';

interface ProgressEntry {
  progress_id: string;
  task: {
    title: string;
    description: string | null;
  };
  status: string;
  points_earned: number | null;
  updated_at: string;
}

interface ProgressStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  total_points_earned: number;
  completion_rate: number;
}

export default function ProgressTracking() {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [progressRes, statsRes] = await Promise.all([
        fetch('/api/progress', { headers }),
        fetch('/api/progress/stats', { headers }),
      ]);

      if (progressRes.ok) setProgress(await progressRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = progress.filter(p => {
    if (filter === 'all') return true;
    return p.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-gray-500">Lädt Fortschritte...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Mein Fortschritt</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Gesamt Aufgaben</p>
            <p className="text-3xl font-bold">{stats.total_tasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Abgeschlossen</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed_tasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">In Bearbeitung</p>
            <p className="text-3xl font-bold text-blue-600">{stats.in_progress_tasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Verdiente Punkte</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.total_points_earned}</p>
          </div>
        </div>
      )}

      {/* Completion Rate */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Abschlussrate</h3>
            <span className="font-semibold">{stats.completion_rate}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
              style={{ width: `${stats.completion_rate}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Ausstehend
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded ${
              filter === 'in_progress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            In Bearbeitung
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded ${
              filter === 'verified'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Abgeschlossen
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Fortschritts-Timeline</h2>

        {filteredProgress.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Keine Fortschritte gefunden</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

            <div className="space-y-6">
              {filteredProgress.map((entry) => (
                <TimelineEntry key={entry.progress_id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineEntry({ entry }: { entry: ProgressEntry }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500', label: 'Ausstehend' },
    in_progress: { color: 'bg-blue-500', label: 'In Bearbeitung' },
    submitted: { color: 'bg-purple-500', label: 'Eingereicht' },
    verified: { color: 'bg-green-500', label: 'Abgeschlossen' },
    rejected: { color: 'bg-red-500', label: 'Abgelehnt' },
  };

  const config = statusConfig[entry.status as keyof typeof statusConfig] || {
    color: 'bg-gray-500',
    label: entry.status,
  };

  return (
    <div className="relative pl-12">
      {/* Timeline Dot */}
      <div className={`absolute left-4 w-4 h-4 rounded-full ${config.color} border-4 border-white`} />

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold">{entry.task.title}</h3>
            {entry.task.description && (
              <p className="text-sm text-gray-600 mt-1">{entry.task.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs text-white ${config.color}`}>
            {config.label}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            {new Date(entry.updated_at).toLocaleString('de-DE')}
          </span>
          {entry.points_earned && (
            <span className="font-semibold text-yellow-600">
              +{entry.points_earned} Punkte
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
