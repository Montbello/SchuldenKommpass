import { useState, useEffect } from 'react';
import type { User, Match } from '../types';
import { getMatches, updateMatchStatus } from '../api/matches';
import { createProgress } from '../api/progress';

interface MatchesPageProps {
  user: User;
}

export default function MatchesPage({ user }: MatchesPageProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, [user.user_id]);

  async function loadMatches() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMatches(user.user_id);
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Matches');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(match: Match) {
    setActionLoading(match.match_id);
    setError(null);
    try {
      // Accept the match
      await updateMatchStatus(match.match_id, 'accepted');
      
      // Create progress entry for this task
      await createProgress({ taskId: match.taskId });
      
      // Update local state
      setMatches(matches.map(m => 
        m.match_id === match.match_id 
          ? { ...m, status: 'accepted' as const }
          : m
      ));
    } catch (err: any) {
      setError(err.message || 'Fehler beim Akzeptieren');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(matchId: string) {
    setActionLoading(matchId);
    setError(null);
    try {
      await updateMatchStatus(matchId, 'rejected');
      setMatches(matches.map(m => 
        m.match_id === matchId 
          ? { ...m, status: 'rejected' as const }
          : m
      ));
    } catch (err: any) {
      setError(err.message || 'Fehler beim Ablehnen');
    } finally {
      setActionLoading(null);
    }
  }

  const pendingMatches = matches.filter(m => m.status === 'pending');
  const acceptedMatches = matches.filter(m => m.status === 'accepted');
  const otherMatches = matches.filter(m => !['pending', 'accepted'].includes(m.status));

  if (loading) {
    return <div className="loading">Matches werden geladen...</div>;
  }

  return (
    <div className="matches-page">
      <h2>Meine Matches</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {matches.length === 0 ? (
        <div className="no-matches">
          <p>Du hast noch keine Matches.</p>
          <p>
            Stelle sicher, dass du <a href="/profile">Skills in deinem Profil</a> hinterlegt 
            und der Datenfreigabe zugestimmt hast.
          </p>
        </div>
      ) : (
        <>
          {/* Pending Matches */}
          {pendingMatches.length > 0 && (
            <section className="matches-section">
              <h3>🔔 Neue Vorschläge ({pendingMatches.length})</h3>
              <div className="matches-grid">
                {pendingMatches.map(match => (
                  <MatchCard
                    key={match.match_id}
                    match={match}
                    onAccept={() => handleAccept(match)}
                    onReject={() => handleReject(match.match_id)}
                    loading={actionLoading === match.match_id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Accepted Matches */}
          {acceptedMatches.length > 0 && (
            <section className="matches-section">
              <h3>✅ Akzeptierte Matches ({acceptedMatches.length})</h3>
              <p className="section-hint">
                Diese Aufgaben findest du unter <a href="/progress">Fortschritt</a>.
              </p>
              <div className="matches-grid">
                {acceptedMatches.map(match => (
                  <MatchCard key={match.match_id} match={match} />
                ))}
              </div>
            </section>
          )}

          {/* Other Matches */}
          {otherMatches.length > 0 && (
            <section className="matches-section">
              <h3>Archiv ({otherMatches.length})</h3>
              <div className="matches-grid muted">
                {otherMatches.map(match => (
                  <MatchCard key={match.match_id} match={match} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  onAccept?: () => void;
  onReject?: () => void;
  loading?: boolean;
}

function MatchCard({ match, onAccept, onReject, loading }: MatchCardProps) {
  const statusLabels: Record<string, string> = {
    pending: '⏳ Offen',
    accepted: '✅ Akzeptiert',
    rejected: '❌ Abgelehnt',
    completed: '🎉 Abgeschlossen',
  };

  return (
    <div className={`match-card status-${match.status}`}>
      <div className="match-header">
        <h4>{match.task?.title || `Task ${match.taskId.substring(0, 8)}...`}</h4>
        <span className="match-score">
          Score: {Math.round(match.score * 100)}%
        </span>
      </div>

      {match.task?.description && (
        <p className="match-description">
          {match.task.description.substring(0, 120)}
          {match.task.description.length > 120 ? '...' : ''}
        </p>
      )}

      {match.task?.required_skill && (
        <span className="skill-badge">{match.task.required_skill}</span>
      )}

      <div className="match-status">
        {statusLabels[match.status] || match.status}
      </div>

      {match.status === 'pending' && onAccept && onReject && (
        <div className="match-actions">
          <button
            onClick={onAccept}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Lädt...' : 'Annehmen'}
          </button>
          <button
            onClick={onReject}
            className="btn btn-secondary"
            disabled={loading}
          >
            Ablehnen
          </button>
        </div>
      )}

      <p className="match-date">
        {new Date(match.assigned_at).toLocaleDateString('de-DE')}
      </p>
    </div>
  );
}
