import { useState, useEffect } from 'react';
import type { User } from '../../types';
import { handleApiResponse } from '../../api/client';

interface CertificateOverviewProps {
  user: User;
}

interface Certificate {
  certificate_id: string;
  title: string;
  description?: string;
  issued_date: string;
  valid_until?: string;
  signed_token?: string;
  issued_by?: string;
}

interface LevelProgress {
  currentLevel: number;
  currentLevelTitle: string;
  totalPoints: number;
  nextLevel: number | null;
  nextLevelTitle: string | null;
  pointsToNextLevel: number;
  progressPercent: number;
  unlockedFeatures: string[];
  nextLevelFeatures: string[];
}

const LEVEL_BADGES: Record<number, { emoji: string; color: string; title: string }> = {
  1: { emoji: '🌱', color: '#10b981', title: 'Newcomer' },
  2: { emoji: '🌿', color: '#059669', title: 'Starter' },
  3: { emoji: '⭐', color: '#f59e0b', title: 'Aktiv' },
  4: { emoji: '🌟', color: '#d97706', title: 'Engagiert' },
  5: { emoji: '💫', color: '#6366f1', title: 'Fortgeschritten' },
  6: { emoji: '🏆', color: '#4f46e5', title: 'Erfahren' },
  7: { emoji: '👑', color: '#7c3aed', title: 'Expert' },
  8: { emoji: '💎', color: '#8b5cf6', title: 'Champion' },
  9: { emoji: '🔥', color: '#ef4444', title: 'Master' },
  10: { emoji: '🎯', color: '#dc2626', title: 'Legend' },
};

export default function CertificateOverview({ user }: CertificateOverviewProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user.user_id]);

  async function loadData() {
    setLoading(true);
    try {
      const [certsRes, progressRes] = await Promise.all([
        fetch(`/api/certificates?userId=${user.user_id}`, { credentials: 'include' }),
        fetch(`/api/certificates/progress/${user.user_id}`, { credentials: 'include' }),
      ]);

      const certs = await handleApiResponse<Certificate[]>(certsRes);
      const progress = await handleApiResponse<{ certificates: Certificate[]; level: LevelProgress }>(progressRes);
      
      setCertificates(certs);
      setLevelProgress(progress.level);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) {
    return <div className="loading">Zertifikate werden geladen...</div>;
  }

  const currentBadge = levelProgress ? LEVEL_BADGES[levelProgress.currentLevel] || LEVEL_BADGES[1] : LEVEL_BADGES[1];

  return (
    <div className="certificate-overview">
      {toast && <div className="toast">{toast}</div>}

      <h1>🏅 Meine Zertifikate & Erfolge</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Level Progress Card */}
      {levelProgress && (
        <div className="level-card">
          <div className="level-badge" style={{ background: currentBadge.color }}>
            <span className="badge-emoji">{currentBadge.emoji}</span>
            <span className="badge-level">Level {levelProgress.currentLevel}</span>
          </div>
          
          <div className="level-info">
            <h2>{levelProgress.currentLevelTitle}</h2>
            <p className="points">🏆 {levelProgress.totalPoints} Punkte</p>
            
            {levelProgress.nextLevel && (
              <div className="progress-section">
                <div className="progress-header">
                  <span>Bis Level {levelProgress.nextLevel} ({levelProgress.nextLevelTitle})</span>
                  <span>{levelProgress.progressPercent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${levelProgress.progressPercent}%`, background: currentBadge.color }} />
                </div>
                <p className="points-needed">Noch {levelProgress.pointsToNextLevel} Punkte</p>
              </div>
            )}
            
            {!levelProgress.nextLevel && <p className="max-level">🎉 Maximales Level!</p>}
          </div>
        </div>
      )}

      {/* Unlocked Features */}
      {levelProgress && levelProgress.unlockedFeatures.length > 0 && (
        <section className="features-section">
          <h3>🔓 Freigeschaltete Features</h3>
          <div className="features-grid">
            {levelProgress.unlockedFeatures.map(f => (
              <span key={f} className="feature-tag">✓ {formatFeature(f)}</span>
            ))}
          </div>
        </section>
      )}

      {/* Certificates Timeline */}
      <section className="certificates-section">
        <h3>📜 Zertifikate ({certificates.length})</h3>
        
        {certificates.length === 0 ? (
          <div className="empty-state">
            <p>Noch keine Zertifikate. Sammeln Sie Punkte um Level aufzusteigen!</p>
          </div>
        ) : (
          <div className="certificates-list">
            {certificates.map(cert => (
              <div key={cert.certificate_id} className="certificate-card">
                <div className="cert-icon">📜</div>
                <div className="cert-content">
                  <h4>{cert.title}</h4>
                  {cert.description && <p>{cert.description}</p>}
                  <div className="cert-meta">
                    <span>📅 {new Date(cert.issued_date).toLocaleDateString('de-DE')}</span>
                    {cert.signed_token && (
                      <button className="verify-btn" onClick={() => showToast('✅ Zertifikat verifiziert!')}>
                        ✓ Verifiziert
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Level Badges */}
      <section className="badges-section">
        <h3>🎖️ Level-Übersicht</h3>
        <div className="badges-grid">
          {Object.entries(LEVEL_BADGES).map(([lvl, badge]) => {
            const unlocked = levelProgress && levelProgress.currentLevel >= parseInt(lvl);
            return (
              <div key={lvl} className={`badge-item ${unlocked ? 'unlocked' : 'locked'}`}>
                <span className="emoji">{badge.emoji}</span>
                <span className="title">{badge.title}</span>
                <span className="level">Lv. {lvl}</span>
              </div>
            );
          })}
        </div>
      </section>

      <style>{`
        .certificate-overview { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .toast { position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 1000; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .alert-error { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
        .level-card { display: flex; gap: 2rem; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .level-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100px; height: 100px; border-radius: 50%; color: white; }
        .badge-emoji { font-size: 2.5rem; }
        .badge-level { font-size: 0.75rem; font-weight: 600; }
        .level-info { flex: 1; }
        .level-info h2 { margin: 0 0 0.5rem; }
        .points { font-size: 1.25rem; color: #6366f1; }
        .progress-section { margin-top: 1rem; }
        .progress-header { display: flex; justify-content: space-between; font-size: 0.875rem; color: #6b7280; }
        .progress-bar { height: 10px; background: #e5e7eb; border-radius: 5px; margin: 0.5rem 0; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
        .points-needed { font-size: 0.75rem; color: #9ca3af; }
        .max-level { color: #10b981; font-weight: 600; }
        section { margin-bottom: 2rem; }
        section h3 { margin-bottom: 1rem; }
        .features-section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .features-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .feature-tag { background: #ecfdf5; color: #059669; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; }
        .empty-state { text-align: center; padding: 2rem; background: #f9fafb; border-radius: 8px; color: #6b7280; }
        .certificates-list { display: flex; flex-direction: column; gap: 1rem; }
        .certificate-card { display: flex; gap: 1rem; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .cert-icon { font-size: 2rem; }
        .cert-content { flex: 1; }
        .cert-content h4 { margin: 0 0 0.5rem; }
        .cert-content p { color: #6b7280; font-size: 0.875rem; margin: 0 0 0.5rem; }
        .cert-meta { display: flex; gap: 1rem; align-items: center; font-size: 0.75rem; color: #9ca3af; }
        .verify-btn { background: #ecfdf5; color: #059669; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
        .badges-section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .badges-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; }
        .badge-item { display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; text-align: center; }
        .badge-item.unlocked { border-color: #6366f1; background: #f5f3ff; }
        .badge-item.locked { opacity: 0.4; filter: grayscale(1); }
        .badge-item .emoji { font-size: 1.5rem; }
        .badge-item .title { font-size: 0.75rem; font-weight: 500; margin-top: 0.25rem; }
        .badge-item .level { font-size: 0.625rem; color: #9ca3af; }
        @media (max-width: 600px) { .level-card { flex-direction: column; align-items: center; text-align: center; } .badges-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </div>
  );
}

function formatFeature(f: string): string {
  const map: Record<string, string> = {
    basic_dashboard: 'Dashboard', profile_view: 'Profil', task_view: 'Aufgaben', task_accept: 'Aufgaben annehmen',
    document_upload: 'Dokumente', community_access: 'Community', advisor_booking: 'Berater buchen',
    premium_support: 'Premium Support', job_board_access: 'Job-Board', partner_offers: 'Partner-Angebote',
    mentoring_access: 'Mentoring', priority_support: 'Priorität', exclusive_events: 'Events', all_access: 'Vollzugriff',
  };
  return map[f] || f;
}
