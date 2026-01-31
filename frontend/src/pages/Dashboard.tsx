import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User, Match, Progress, AdvisorType } from '../types';
import { getMatches } from '../api/matches';
import { getProgress } from '../api/progress';

interface DashboardProps {
  user: User;
}

const advisorInfo: Record<AdvisorType, { name: string; emoji: string }> = {
  structured: { name: 'Der Strukturierte', emoji: '📊' },
  empathetic: { name: 'Der Empathische', emoji: '💚' },
  motivator: { name: 'Der Motivator', emoji: '🚀' },
};

const dailyTips = [
  'Tipp: Führen Sie ein Haushaltsbuch, um Ihre Ausgaben im Blick zu behalten.',
  'Tipp: Kleine Beträge regelmäßig zurückzulegen hilft beim Schuldenabbau.',
  'Tipp: Priorisieren Sie Schulden mit den höchsten Zinsen.',
  'Tipp: Setzen Sie sich realistische Ziele – jeder Schritt zählt!',
  'Tipp: Nutzen Sie kostenlose Schuldnerberatungen in Ihrer Nähe.',
];

export default function Dashboard({ user }: DashboardProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  const advisorType = user.selected_advisor || 'empathetic';
  const advisor = advisorInfo[advisorType];
  const todaysTip = dailyTips[new Date().getDay() % dailyTips.length];

  useEffect(() => {
    async function loadData() {
      try {
        const [matchData, progressData] = await Promise.all([
          getMatches(user.user_id).catch(() => []),
          getProgress(user.user_id).catch(() => []),
        ]);
        setMatches(matchData);
        setProgress(progressData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.user_id]);

  const pendingMatches = matches.filter(m => m.status === 'pending').length;
  const activeProgress = progress.filter(p => p.status === 'in_progress').length;
  const totalPoints = progress.reduce((sum, p) => sum + (p.points_earned || 0), 0);

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Hallo, {user.name || 'Nutzer'}! 👋</h2>
      <p className="dashboard-subtitle">Schön, dass Sie da sind. Hier ist Ihr Überblick.</p>

      {/* Advisor Welcome Card */}
      <div className="advisor-welcome">
        <div className="advisor-avatar">{advisor.emoji}</div>
        <div className="advisor-message">
          <h3>{advisor.name}</h3>
          <p>
            {advisorType === 'structured' && 'Lassen Sie uns heute strukturiert an Ihren Zielen arbeiten.'}
            {advisorType === 'empathetic' && 'Ich bin hier, um Sie zu unterstützen. Wie kann ich helfen?'}
            {advisorType === 'motivator' && 'Großartig, dass Sie hier sind! Jeder Tag ist ein neuer Anfang! 💪'}
          </p>
        </div>
        <div className="advisor-action">
          <Link to="/chat" className="btn btn-secondary btn-small">
            Chat öffnen
          </Link>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Offene Matches</h3>
          <p className="stat-number">{pendingMatches}</p>
          <Link to="/matches">Ansehen →</Link>
        </div>
        
        <div className="stat-card">
          <h3>Aktive Aufgaben</h3>
          <p className="stat-number">{activeProgress}</p>
          <Link to="/progress">Ansehen →</Link>
        </div>
        
        <div className="stat-card">
          <h3>Punkte</h3>
          <p className="stat-number">{totalPoints}</p>
        </div>
        
        <div className="stat-card">
          <h3>Skills</h3>
          <p className="stat-number">{user.skills?.length || 0}</p>
          <Link to="/profile">Verwalten →</Link>
        </div>
      </div>

      <section className="quick-actions">
        <h3>Schnellzugriff</h3>
        <div className="action-buttons">
          <Link to="/tasks" className="btn btn-primary">
            📝 Neue Aufgaben finden
          </Link>
          <Link to="/advisor" className="btn btn-secondary">
            🧑‍💼 Berater wechseln
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            ⚙️ Profil bearbeiten
          </Link>
        </div>
      </section>

      {/* Daily Tip */}
      <div className="daily-tip">
        <div className="tip-icon">💡</div>
        <div>
          <h4>Tipp des Tages</h4>
          <p>{todaysTip}</p>
        </div>
      </div>

      {!user.consent_data_sharing && (
        <div className="alert alert-warning" style={{ marginTop: '1.5rem' }}>
          <strong>Hinweis:</strong> Sie haben noch nicht der Datenfreigabe zugestimmt.{' '}
          <Link to="/profile">Jetzt in den Profileinstellungen aktivieren</Link>, um Matches zu erhalten.
        </div>
      )}

      {!user.selected_advisor && (
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          <strong>Tipp:</strong> Wählen Sie Ihren persönlichen KI-Berater!{' '}
          <Link to="/advisor">Jetzt auswählen</Link>
        </div>
      )}
    </div>
  );
}
