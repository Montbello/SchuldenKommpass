import { useState, useEffect } from 'react';

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  required_skill: string | null;
  estimated_time: number | null;
  active: boolean;
  organisation?: {
    name: string;
    type: string;
  };
  created_at: string;
}

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    organisation_type: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.organisation_type) params.append('org_type', filters.organisation_type);

      const response = await fetch(`/api/tasks?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setTasks(data.filter((t: Task) => t.active));
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Verfügbare Aufgaben</h1>
          <p className="text-gray-600 mt-1">
            Finde passende Aufgaben und sammle Punkte
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Verfügbare Aufgaben</p>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Suche</label>
            <input
              type="text"
              placeholder="Aufgabe suchen..."
              className="w-full px-3 py-2 border rounded-md"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fähigkeit</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            >
              <option value="">Alle Fähigkeiten</option>
              <option value="Lagerhaltung">Lagerhaltung</option>
              <option value="Kundenservice">Kundenservice</option>
              <option value="IT">IT</option>
              <option value="Handwerk">Handwerk</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Organisationstyp</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.organisation_type}
              onChange={(e) => setFilters({ ...filters, organisation_type: e.target.value })}
            >
              <option value="">Alle Typen</option>
              <option value="JOBCENTER">Jobcenter</option>
              <option value="NGO">NGO</option>
              <option value="PARTNER">Partner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Lädt Aufgaben...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <span className="text-6xl">📋</span>
          <h3 className="text-xl font-semibold mt-4">Keine Aufgaben gefunden</h3>
          <p className="text-gray-600 mt-2">
            Ändere deine Filter oder schaue später wieder vorbei
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <TaskCard
              key={task.task_id}
              task={task}
              onSelect={() => setSelectedTask(task)}
            />
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onSelect }: { task: Task; onSelect: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg flex-1">{task.title}</h3>
        {task.estimated_time && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs ml-2">
            ~{task.estimated_time}min
          </span>
        )}
      </div>

      {task.organisation && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">{task.organisation.name}</span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
            {task.organisation.type}
          </span>
        </div>
      )}

      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
        {task.description || 'Keine Beschreibung verfügbar'}
      </p>

      {task.required_skill && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <span>🎯</span>
            {task.required_skill}
          </span>
        </div>
      )}

      <button
        onClick={onSelect}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Details ansehen
      </button>
    </div>
  );
}

function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      const response = await fetch('/api/tasks/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ task_id: task.task_id }),
      });

      if (response.ok) {
        alert('Bewerbung erfolgreich! Du wirst benachrichtigt.');
        onClose();
      }
    } catch (error) {
      console.error('Fehler beim Bewerben:', error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{task.title}</h2>
              {task.organisation && (
                <p className="text-gray-600 mt-1">{task.organisation.name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-3">
            {task.required_skill && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                🎯 {task.required_skill}
              </span>
            )}
            {task.estimated_time && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                ⏱️ ~{task.estimated_time} Minuten
              </span>
            )}
            {task.organisation && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                🏢 {task.organisation.type}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Beschreibung</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {task.description || 'Keine detaillierte Beschreibung verfügbar.'}
            </p>
          </div>

          {/* Requirements */}
          {task.required_skill && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Anforderungen</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Fähigkeit: {task.required_skill}</li>
                <li>Geschätzte Dauer: {task.estimated_time || 'Variabel'} Minuten</li>
                <li>Abgeschlossenes Onboarding erforderlich</li>
              </ul>
            </div>
          )}

          {/* Benefits */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Was du bekommst</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">⭐</span>
                <span>Punkte für dein Level</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">🏅</span>
                <span>Zertifikat bei Abschluss</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">📈</span>
                <span>Erfahrung und Referenzen</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Schließen
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {applying ? 'Wird gesendet...' : 'Jetzt bewerben'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
