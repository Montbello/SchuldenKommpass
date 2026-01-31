import { useState, useEffect, useRef } from 'react';
import type { User, Progress } from '../types';
import { getProgress, updateProgress, uploadDocument } from '../api/progress';

interface ProgressPageProps {
  user: User;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export default function ProgressPage({ user }: ProgressPageProps) {
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, [user.user_id]);

  async function loadProgress() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProgress(user.user_id);
      setProgressList(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(progressId: string, file: File) {
    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Nur PDF, JPG und PNG Dateien sind erlaubt.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Datei darf maximal 5MB groß sein.');
      return;
    }

    setUploadingFor(progressId);
    setError(null);
    setSuccess(null);

    try {
      // Upload document
      const doc = await uploadDocument(file, `Nachweis für Aufgabe`);
      
      // Update progress with document reference
      await updateProgress(progressId, {
        status: 'submitted',
        proofDocumentId: doc.document_id,
      });

      // Update local state
      setProgressList(progressList.map(p =>
        p.progress_id === progressId
          ? { ...p, status: 'submitted' as const, proofDocumentId: doc.document_id }
          : p
      ));

      setSuccess('Nachweis erfolgreich hochgeladen!');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Upload');
    } finally {
      setUploadingFor(null);
    }
  }

  const inProgress = progressList.filter(p => p.status === 'in_progress');
  const submitted = progressList.filter(p => p.status === 'submitted');
  const verified = progressList.filter(p => p.status === 'verified');
  const rejected = progressList.filter(p => p.status === 'rejected');

  if (loading) {
    return <div className="loading">Fortschritt wird geladen...</div>;
  }

  return (
    <div className="progress-page">
      <h2>Mein Fortschritt</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {progressList.length === 0 ? (
        <div className="no-progress">
          <p>Du hast noch keine aktiven Aufgaben.</p>
          <p>
            Akzeptiere einen <a href="/matches">Match</a>, um loszulegen!
          </p>
        </div>
      ) : (
        <>
          {/* In Progress */}
          {inProgress.length > 0 && (
            <section className="progress-section">
              <h3>🔄 In Bearbeitung ({inProgress.length})</h3>
              <div className="progress-grid">
                {inProgress.map(p => (
                  <ProgressCard
                    key={p.progress_id}
                    progress={p}
                    onUpload={(file) => handleFileUpload(p.progress_id, file)}
                    uploading={uploadingFor === p.progress_id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Submitted */}
          {submitted.length > 0 && (
            <section className="progress-section">
              <h3>📤 Eingereicht ({submitted.length})</h3>
              <p className="section-hint">Wartet auf Verifizierung durch einen Berater.</p>
              <div className="progress-grid">
                {submitted.map(p => (
                  <ProgressCard key={p.progress_id} progress={p} />
                ))}
              </div>
            </section>
          )}

          {/* Verified */}
          {verified.length > 0 && (
            <section className="progress-section">
              <h3>✅ Verifiziert ({verified.length})</h3>
              <div className="progress-grid">
                {verified.map(p => (
                  <ProgressCard key={p.progress_id} progress={p} />
                ))}
              </div>
            </section>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <section className="progress-section">
              <h3>❌ Abgelehnt ({rejected.length})</h3>
              <div className="progress-grid">
                {rejected.map(p => (
                  <ProgressCard
                    key={p.progress_id}
                    progress={p}
                    onUpload={(file) => handleFileUpload(p.progress_id, file)}
                    uploading={uploadingFor === p.progress_id}
                    showResubmit
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className="points-summary">
        <h3>Punkte-Übersicht</h3>
        <p className="total-points">
          Gesammelte Punkte: <strong>{progressList.reduce((sum, p) => sum + (p.points_earned || 0), 0)}</strong>
        </p>
      </section>
    </div>
  );
}

interface ProgressCardProps {
  progress: Progress;
  onUpload?: (file: File) => void;
  uploading?: boolean;
  showResubmit?: boolean;
}

function ProgressCard({ progress, onUpload, uploading, showResubmit }: ProgressCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusLabels: Record<string, { label: string; color: string }> = {
    in_progress: { label: '🔄 In Bearbeitung', color: 'blue' },
    submitted: { label: '📤 Eingereicht', color: 'orange' },
    verified: { label: '✅ Verifiziert', color: 'green' },
    rejected: { label: '❌ Abgelehnt', color: 'red' },
  };

  const status = statusLabels[progress.status] || { label: progress.status, color: 'gray' };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  }

  return (
    <div className={`progress-card status-${progress.status}`}>
      <div className="progress-header">
        <h4>{progress.task?.title || `Aufgabe ${progress.taskId.substring(0, 8)}...`}</h4>
        <span className={`status-badge ${status.color}`}>{status.label}</span>
      </div>

      {progress.task?.description && (
        <p className="progress-description">
          {progress.task.description.substring(0, 100)}...
        </p>
      )}

      {progress.points_earned > 0 && (
        <p className="points-earned">
          🏆 {progress.points_earned} Punkte
        </p>
      )}

      {progress.proofDocumentId && (
        <p className="proof-uploaded">📎 Nachweis hochgeladen</p>
      )}

      {(progress.status === 'in_progress' || showResubmit) && onUpload && (
        <div className="upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            disabled={uploading}
          >
            {uploading ? 'Wird hochgeladen...' : showResubmit ? 'Erneut einreichen' : 'Nachweis hochladen'}
          </button>
          <small>PDF, JPG oder PNG (max. 5MB)</small>
        </div>
      )}

      <p className="progress-date">
        Aktualisiert: {new Date(progress.updated_at).toLocaleDateString('de-DE')}
      </p>
    </div>
  );
}
