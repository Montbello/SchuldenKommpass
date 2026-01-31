import { useState } from 'react';
import type { User } from '../types';
import { generateReport, type Report, type GeneratedReport } from '../api/reports';

interface ReportPageProps {
  user: User;
}

export default function ReportPage({ user }: ReportPageProps) {
  const [userStory, setUserStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedReport, setGeneratedReport] = useState<Report | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (userStory.trim().length < 10) {
      setError('Bitte beschreiben Sie Ihre Situation ausführlicher (mindestens 10 Zeichen).');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedReport(null);

    try {
      const { report } = await generateReport({ userStory });
      setGeneratedReport(report);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Generieren des Berichts');
    } finally {
      setLoading(false);
    }
  }

  const content = generatedReport?.content as GeneratedReport | undefined;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Behörden-Statusbericht</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Beschreiben Sie Ihre persönliche Situation. Basierend auf Ihren Angaben, 
        Ihrem Fortschritt und Ihren Dokumenten wird ein professioneller Statusbericht 
        für Behörden (z.B. Jobcenter) erstellt.
      </p>

      {/* Story Input Form */}
      <form onSubmit={handleGenerate} style={{ marginBottom: 32 }}>
        <label htmlFor="story" style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
          Ihre Situation
        </label>
        <textarea
          id="story"
          value={userStory}
          onChange={(e) => setUserStory(e.target.value)}
          placeholder="Beschreiben Sie Ihre aktuelle Situation, Ihre Schulden, was Sie bereits unternommen haben und welche Unterstützung Sie benötigen..."
          rows={6}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: '1px solid #ccc',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          disabled={loading}
        />
        
        {error && (
          <p style={{ color: '#dc2626', marginTop: 8 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || userStory.trim().length < 10}
          style={{
            marginTop: 16,
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{
                width: 16,
                height: 16,
                border: '2px solid #fff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Bericht wird erstellt...
            </>
          ) : (
            '📄 Bericht generieren'
          )}
        </button>
      </form>

      {/* Generated Report Display */}
      {generatedReport && content && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 24,
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 16,
            borderBottom: '1px solid #e2e8f0',
          }}>
            <h2 style={{ margin: 0 }}>Statusbericht</h2>
            <span style={{ color: '#64748b', fontSize: 14 }}>
              Erstellt am {new Date(generatedReport.generated_at).toLocaleDateString('de-DE')}
            </span>
          </div>

          {/* Summary */}
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#1e40af', marginBottom: 8 }}>Zusammenfassung</h3>
            <p style={{ 
              backgroundColor: '#fff', 
              padding: 16, 
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              lineHeight: 1.6,
            }}>
              {content.summary}
            </p>
          </section>

          {/* Status Assessment */}
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#1e40af', marginBottom: 8 }}>Statusbewertung</h3>
            <p style={{ 
              backgroundColor: '#fff', 
              padding: 16, 
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {content.statusAssessment}
            </p>
          </section>

          {/* Recommendations */}
          {content.recommendations && content.recommendations.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ color: '#1e40af', marginBottom: 8 }}>Empfehlungen</h3>
              <ul style={{ 
                backgroundColor: '#fff', 
                padding: '16px 16px 16px 32px', 
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                margin: 0,
              }}>
                {content.recommendations.map((rec, i) => (
                  <li key={i} style={{ marginBottom: 8, lineHeight: 1.6 }}>{rec}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Next Steps */}
          {content.nextSteps && content.nextSteps.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ color: '#1e40af', marginBottom: 8 }}>Nächste Schritte</h3>
              <ol style={{ 
                backgroundColor: '#fff', 
                padding: '16px 16px 16px 32px', 
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                margin: 0,
              }}>
                {content.nextSteps.map((step, i) => (
                  <li key={i} style={{ marginBottom: 8, lineHeight: 1.6 }}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #e2e8f0',
          }}>
            <button
              onClick={() => window.print()}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              🖨️ Drucken
            </button>
            <button
              onClick={() => {
                const text = `STATUSBERICHT\n\nZusammenfassung:\n${content.summary}\n\nStatusbewertung:\n${content.statusAssessment}\n\nEmpfehlungen:\n${content.recommendations?.join('\n') || '-'}\n\nNächste Schritte:\n${content.nextSteps?.join('\n') || '-'}`;
                navigator.clipboard.writeText(text);
              }}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              📋 Kopieren
            </button>
          </div>
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
