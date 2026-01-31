import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User, Match, Progress, AdvisorType } from '../types';
import { getMatches } from '../api/matches';
import { getProgress } from '../api/progress';
import ProgressRing from '../components/ProgressRing';

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
  const completedProgress = progress.filter(p => p.status === 'verified').length;
  const totalTasks = progress.length || 1;
  const progressPercent = Math.round((completedProgress / totalTasks) * 100);
  const totalPoints = progress.reduce((sum, p) => sum + (p.points_earned || 0), 0);
  const documentsCount = progress.filter(p => p.proofDocumentId).length;

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Willkommen zurück, {user.name || 'Nutzer'}! 👋</h2>
      <p className="dashboard-subtitle">Hier ist Ihr aktueller Fortschritt auf dem Weg zur finanziellen Freiheit.</p>

      {/* PROMINENT REPORT CTA - Das Herzstück für die Demo */}
      <div className="report-cta-card">
        <div className="report-cta-content">
          <div className="report-cta-icon">📄</div>
          <div className="report-cta-text">
            <h3>Behörden-Statusbericht erstellen</h3>
            <p>Generieren Sie einen professionellen Report für Jobcenter, Schuldnerberatung oder andere Institutionen – powered by KI.</p>
          </div>
        </div>
        <Link to="/report" className="btn btn-large btn-report">
          <span className="btn-icon-left">🤖</span>
          Jetzt Report generieren
          <span className="btn-arrow">→</span>
        </Link>
      </div>

      {/* Progress Overview mit Ring */}
      <div className="progress-overview">
        <div className="progress-ring-section">
          <ProgressRing progress={progressPercent} size={140} strokeWidth={12} />
          <p className="progress-label">Gesamtfortschritt</p>
        </div>
        <div className="progress-stats">
          <div className="progress-stat-item">
            <span className="stat-value">{totalPoints}</span>
            <span className="stat-label">Punkte gesammelt</span>
          </div>
          <div className="progress-stat-item">
            <span className="stat-value">{completedProgress}/{totalTasks}</span>
            <span className="stat-label">Aufgaben erledigt</span>
          </div>
          <div className="progress-stat-item">
            <span className="stat-value">{documentsCount}</span>
            <span className="stat-label">Dokumente</span>
          </div>
        </div>
      </div>

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
          <Link to="/report" className="btn btn-accent">
            📄 Behörden-Report
          </Link>
          <Link to="/tasks" className="btn btn-primary">
            📝 Neue Aufgaben
          </Link>
          <Link to="/progress" className="btn btn-secondary">
            📈 Fortschritt
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            ⚙️ Profil
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
