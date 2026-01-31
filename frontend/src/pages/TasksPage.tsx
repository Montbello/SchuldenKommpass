import { useState, useEffect } from 'react';
import type { User, Task } from '../types';
import { getTasks } from '../api/tasks';

interface TasksPageProps {
  user: User;
}

export default function TasksPage({ user }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, [skillFilter]);

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks(skillFilter ? { skill: skillFilter } : undefined);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Aufgaben');
    } finally {
      setLoading(false);
    }
  }

  // Get unique skills from user for quick filter
  const userSkills = user.skills?.map(s => s.category) || [];

  if (loading) {
    return <div className="loading">Aufgaben werden geladen...</div>;
  }

  return (
    <div className="tasks-page">
      <h2>Verfügbare Aufgaben</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="tasks-filter">
        <label htmlFor="skillFilter">Nach Skill filtern:</label>
        <select
          id="skillFilter"
          value={skillFilter}
          onChange={e => setSkillFilter(e.target.value)}
        >
          <option value="">Alle Aufgaben</option>
          {userSkills.map(skill => (
            <option key={skill} value={skill}>
              {skill} (dein Skill)
            </option>
          ))}
        </select>
        <button onClick={loadTasks} className="btn btn-small">
          Aktualisieren
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="no-tasks">
          <p>Keine Aufgaben gefunden.</p>
          {skillFilter && (
            <p>
              <button onClick={() => setSkillFilter('')} className="btn btn-link">
                Filter zurücksetzen
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <div
              key={task.task_id}
              className={`task-card ${selectedTask?.task_id === task.task_id ? 'selected' : ''}`}
              onClick={() => setSelectedTask(task)}
            >
              <h3>{task.title}</h3>
              {task.required_skill && (
                <span className="skill-badge">{task.required_skill}</span>
              )}
              {task.estimated_time && (
                <p className="estimated-time">
                  ⏱️ ca. {task.estimated_time} Minuten
                </p>
              )}
              {task.description && (
                <p className="task-description">
                  {task.description.substring(0, 100)}
                  {task.description.length > 100 ? '...' : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTask(null)}>
              ✕
            </button>
            
            <h2>{selectedTask.title}</h2>
            
            {selectedTask.required_skill && (
              <p>
                <strong>Benötigter Skill:</strong> {selectedTask.required_skill}
              </p>
            )}
            
            {selectedTask.estimated_time && (
              <p>
                <strong>Geschätzte Zeit:</strong> {selectedTask.estimated_time} Minuten
              </p>
            )}
            
            {selectedTask.description && (
              <div className="task-full-description">
                <strong>Beschreibung:</strong>
                <p>{selectedTask.description}</p>
              </div>
            )}

            <p className="task-date">
              Erstellt am: {new Date(selectedTask.created_at).toLocaleDateString('de-DE')}
            </p>

            <div className="modal-actions">
              <button className="btn btn-primary">
                Interesse bekunden
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedTask(null)}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
