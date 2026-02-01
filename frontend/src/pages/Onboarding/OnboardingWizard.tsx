import { useState, useEffect } from 'react';
import type { User } from '../../types';
import DocumentUpload from '../../components/DocumentUpload';
import { uploadDocument } from '../../api/progress';
import {
  getOnboardingStatus,
  processBasicData,
  processDocumentsStep,
  processSkillsStep,
  processStoryStep,
  type OnboardingStatus,
  type StepResult,
} from '../../api/onboarding';

interface OnboardingWizardProps {
  user: User;
  onComplete: () => void;
}

const STEPS = [
  { key: 'basic', label: 'Basisdaten', icon: '👤' },
  { key: 'documents', label: 'Nachweise', icon: '📄' },
  { key: 'skills', label: 'Fähigkeiten', icon: '💪' },
  { key: 'story', label: 'Ihre Geschichte', icon: '📝' },
];

const SKILL_CATEGORIES = [
  'Handwerk',
  'Büro & Verwaltung',
  'IT & Computer',
  'Pflege & Soziales',
  'Gastronomie',
  'Logistik',
  'Einzelhandel',
  'Sonstiges',
];

export default function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [result, setResult] = useState<StepResult | null>(null);

  // Form state
  const [basicData, setBasicData] = useState({
    name: user.name || '',
    dateOfBirth: '',
    hasDisabilities: false,
    disabilityType: '',
    consentDataProcessing: false,
    consentDataSharing: false,
    consentPartnerSharing: false,
  });

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});

  const [skills, setSkills] = useState<Array<{ category: string; description: string }>>([
    { category: '', description: '' },
  ]);

  const [userStory, setUserStory] = useState('');

  useEffect(() => {
    loadStatus();
  }, [user.user_id]);

  async function loadStatus() {
    try {
      const data = await getOnboardingStatus(user.user_id);
      setStatus(data);
      
      // Set current step based on status
      const stepIndex = STEPS.findIndex(s => s.key === data.currentStep);
      if (stepIndex >= 0) {
        setCurrentStep(stepIndex);
      }
      
      // Pre-fill form data from existing status
      if (data.user.name) setBasicData(prev => ({ ...prev, name: data.user.name! }));
      if (data.user.date_of_birth) {
        setBasicData(prev => ({ 
          ...prev, 
          dateOfBirth: data.user.date_of_birth!.split('T')[0] 
        }));
      }
      if (data.user.consent_data_processing) {
        setBasicData(prev => ({ ...prev, consentDataProcessing: true }));
      }
      if (data.user.consent_data_sharing) {
        setBasicData(prev => ({ ...prev, consentDataSharing: true }));
      }
      if (data.user.consent_partner_sharing) {
        setBasicData(prev => ({ ...prev, consentPartnerSharing: true }));
      }
      if (data.user.user_story) {
        setUserStory(data.user.user_story);
      }
      if (data.user.skills && data.user.skills.length > 0) {
        setSkills(data.user.skills.map(s => ({ 
          category: s.category, 
          description: s.description || '' 
        })));
      }
      
      // Check for uploaded documents
      const docs: Record<string, string> = {};
      data.user.documents.forEach(d => {
        docs[d.document_category] = d.document_id;
      });
      setUploadedDocs(docs);
      
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentUpload(file: File, category: string) {
    const doc = await uploadDocument(file, `Onboarding: ${category}`);
    setUploadedDocs(prev => ({ ...prev, [category]: doc.document_id }));
  }

  async function handleSubmitBasic() {
    if (!basicData.consentDataProcessing) {
      setError('Bitte akzeptieren Sie die Datenschutzbestimmungen.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await processBasicData(user.user_id, {
        name: basicData.name,
        dateOfBirth: basicData.dateOfBirth,
        disabilities: basicData.hasDisabilities 
          ? { type: basicData.disabilityType } 
          : undefined,
        consentDataProcessing: basicData.consentDataProcessing,
        consentDataSharing: basicData.consentDataSharing,
        consentPartnerSharing: basicData.consentPartnerSharing,
      });
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitDocuments() {
    const requiredDocs = status?.requiredDocuments || ['PROOF_FINANCIAL'];
    const missing = requiredDocs.filter(doc => !uploadedDocs[doc]);
    
    if (missing.length > 0) {
      setError(`Bitte laden Sie alle erforderlichen Nachweise hoch.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await processDocumentsStep(user.user_id);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitSkills() {
    const validSkills = skills.filter(s => s.category);
    
    if (validSkills.length === 0) {
      setError('Bitte geben Sie mindestens eine Fähigkeit an.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await processSkillsStep(user.user_id, { skills: validSkills });
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitStory() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await processStoryStep(user.user_id, { userStory });
      setResult(res);
      
      if (res.status === 'APPROVED') {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  }

  function addSkill() {
    setSkills([...skills, { category: '', description: '' }]);
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index));
  }

  function updateSkill(index: number, field: 'category' | 'description', value: string) {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  }

  if (loading) {
    return <div className="loading">Onboarding wird geladen...</div>;
  }

  if (result) {
    return (
      <div className="onboarding-result">
        <div className={`result-card ${result.status?.toLowerCase()}`}>
          <h2>{result.message}</h2>
          
          {result.status === 'APPROVED' && (
            <p>Sie werden in Kürze weitergeleitet...</p>
          )}
          
          {result.status === 'PENDING_REVIEW' && (
            <>
              <p>Ein Berater wird Ihre Unterlagen prüfen.</p>
              <p>Sie werden per E-Mail benachrichtigt.</p>
            </>
          )}
          
          {result.stabilityScore !== undefined && (
            <p className="score">Stabilitätsscore: {result.stabilityScore.toFixed(1)}</p>
          )}
          
          {result.missingRequirements && result.missingRequirements.length > 0 && (
            <div className="missing">
              <h4>Fehlende Anforderungen:</h4>
              <ul>
                {result.missingRequirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-wizard">
      <h1>Willkommen bei SchuldenKompass</h1>
      <p className="intro">
        Bitte vervollständigen Sie Ihr Profil in wenigen Schritten.
      </p>

      {/* Progress Indicator */}
      <div className="progress-steps">
        {STEPS.map((step, index) => (
          <div
            key={step.key}
            className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="step-icon">
              {index < currentStep ? '✓' : step.icon}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Step 1: Basic Data + Consent */}
      {currentStep === 0 && (
        <div className="step-content">
          <h2>Schritt 1: Basisdaten & Einwilligung</h2>
          
          <div className="form-group">
            <label>Vollständiger Name *</label>
            <input
              type="text"
              value={basicData.name}
              onChange={(e) => setBasicData({ ...basicData, name: e.target.value })}
              placeholder="Max Mustermann"
              required
            />
          </div>

          <div className="form-group">
            <label>Geburtsdatum *</label>
            <input
              type="date"
              value={basicData.dateOfBirth}
              onChange={(e) => setBasicData({ ...basicData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={basicData.hasDisabilities}
                onChange={(e) => setBasicData({ ...basicData, hasDisabilities: e.target.checked })}
              />
              Ich habe eine Behinderung oder Einschränkung
            </label>
          </div>

          {basicData.hasDisabilities && (
            <div className="form-group">
              <label>Art der Einschränkung</label>
              <input
                type="text"
                value={basicData.disabilityType}
                onChange={(e) => setBasicData({ ...basicData, disabilityType: e.target.value })}
                placeholder="z.B. Gehbehinderung, Depression, etc."
              />
            </div>
          )}

          <div className="consent-section">
            <h3>Datenschutz & Einwilligungen (DSGVO)</h3>
            
            <div className="consent-item">
              <label>
                <input
                  type="checkbox"
                  checked={basicData.consentDataProcessing}
                  onChange={(e) => setBasicData({ ...basicData, consentDataProcessing: e.target.checked })}
                />
                <span>
                  <strong>Datenverarbeitung *</strong><br />
                  Ich stimme der Verarbeitung meiner personenbezogenen Daten gemäß der{' '}
                  <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> zu.
                </span>
              </label>
            </div>

            <div className="consent-item">
              <label>
                <input
                  type="checkbox"
                  checked={basicData.consentDataSharing}
                  onChange={(e) => setBasicData({ ...basicData, consentDataSharing: e.target.checked })}
                />
                <span>
                  <strong>Datenfreigabe</strong><br />
                  Ich erlaube die Weitergabe meines Fortschritts an zugewiesene Institutionen (z.B. Jobcenter).
                </span>
              </label>
            </div>

            <div className="consent-item">
              <label>
                <input
                  type="checkbox"
                  checked={basicData.consentPartnerSharing}
                  onChange={(e) => setBasicData({ ...basicData, consentPartnerSharing: e.target.checked })}
                />
                <span>
                  <strong>Partner-Vermittlung</strong><br />
                  Ich erlaube die Weitergabe meiner Fähigkeiten an potenzielle Arbeitgeber/Partner.
                </span>
              </label>
            </div>
          </div>

          <div className="step-actions">
            <button
              className="btn btn-primary"
              onClick={handleSubmitBasic}
              disabled={submitting || !basicData.name || !basicData.dateOfBirth}
            >
              {submitting ? 'Wird gespeichert...' : 'Weiter'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Documents */}
      {currentStep === 1 && (
        <div className="step-content">
          <h2>Schritt 2: Nachweise hochladen</h2>
          <p>Bitte laden Sie die erforderlichen Dokumente hoch.</p>

          <DocumentUpload
            category="PROOF_FINANCIAL"
            categoryLabel="Finanzieller Nachweis (Kontoauszug, Schuldenaufstellung) *"
            onUpload={handleDocumentUpload}
            existingDocument={uploadedDocs.PROOF_FINANCIAL ? { document_id: uploadedDocs.PROOF_FINANCIAL, uploaded_at: new Date().toISOString() } : null}
          />

          {basicData.hasDisabilities && (
            <DocumentUpload
              category="PROOF_MEDICAL"
              categoryLabel="Medizinischer Nachweis (Attest, Bescheinigung)"
              onUpload={handleDocumentUpload}
              existingDocument={uploadedDocs.PROOF_MEDICAL ? { document_id: uploadedDocs.PROOF_MEDICAL, uploaded_at: new Date().toISOString() } : null}
            />
          )}

          <DocumentUpload
            category="PROOF_IDENTITY"
            categoryLabel="Identitätsnachweis (Ausweis, Pass) - Optional"
            onUpload={handleDocumentUpload}
            existingDocument={uploadedDocs.PROOF_IDENTITY ? { document_id: uploadedDocs.PROOF_IDENTITY, uploaded_at: new Date().toISOString() } : null}
          />

          <div className="step-actions">
            <button className="btn btn-secondary" onClick={() => setCurrentStep(0)}>
              Zurück
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitDocuments}
              disabled={submitting || !uploadedDocs.PROOF_FINANCIAL}
            >
              {submitting ? 'Wird gespeichert...' : 'Weiter'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Skills */}
      {currentStep === 2 && (
        <div className="step-content">
          <h2>Schritt 3: Fähigkeiten & Interessen</h2>
          <p>Welche Fähigkeiten und Erfahrungen bringen Sie mit?</p>

          {skills.map((skill, index) => (
            <div key={index} className="skill-row">
              <div className="form-group">
                <label>Kategorie</label>
                <select
                  value={skill.category}
                  onChange={(e) => updateSkill(index, 'category', e.target.value)}
                >
                  <option value="">-- Bitte wählen --</option>
                  {SKILL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Beschreibung (optional)</label>
                <input
                  type="text"
                  value={skill.description}
                  onChange={(e) => updateSkill(index, 'description', e.target.value)}
                  placeholder="z.B. 3 Jahre Erfahrung als..."
                />
              </div>

              {skills.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeSkill(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn btn-add" onClick={addSkill}>
            + Weitere Fähigkeit hinzufügen
          </button>

          <div className="step-actions">
            <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
              Zurück
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitSkills}
              disabled={submitting || !skills.some(s => s.category)}
            >
              {submitting ? 'Wird gespeichert...' : 'Weiter'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Story */}
      {currentStep === 3 && (
        <div className="step-content">
          <h2>Schritt 4: Ihre Geschichte (optional)</h2>
          <p>
            Erzählen Sie uns von Ihrer Situation. Dies hilft uns, Sie besser zu unterstützen
            und einen passenden Report für Behörden zu erstellen.
          </p>

          <div className="form-group">
            <label>Ihre Situation</label>
            <textarea
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              rows={8}
              placeholder="Beschreiben Sie Ihre aktuelle Situation, Herausforderungen und Ziele..."
            />
            <small>{userStory.length} / 2000 Zeichen</small>
          </div>

          <div className="step-actions">
            <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
              Zurück
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitStory}
              disabled={submitting}
            >
              {submitting ? 'Wird verarbeitet...' : 'Onboarding abschließen'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .onboarding-wizard {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem;
        }
        .intro {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        .step-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .step.active .step-icon {
          background: #6366f1;
          color: white;
        }
        .step.completed .step-icon {
          background: #10b981;
          color: white;
        }
        .step-label {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .step.active .step-label {
          color: #6366f1;
          font-weight: 600;
        }
        .step-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }
        .form-group input[type="text"],
        .form-group input[type="date"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
        }
        .form-group textarea {
          resize: vertical;
        }
        .form-group small {
          color: #9ca3af;
          font-size: 0.75rem;
        }
        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .consent-section {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .consent-section h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        .consent-item {
          margin-bottom: 1rem;
        }
        .consent-item label {
          display: flex;
          gap: 0.75rem;
          cursor: pointer;
        }
        .consent-item input[type="checkbox"] {
          margin-top: 0.25rem;
        }
        .consent-item span {
          font-size: 0.875rem;
          line-height: 1.4;
        }
        .consent-item a {
          color: #6366f1;
        }
        .skill-row {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }
        .skill-row .form-group {
          flex: 1;
          margin-bottom: 0;
        }
        .btn-remove {
          padding: 0.5rem;
          background: #fee2e2;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: #dc2626;
        }
        .btn-add {
          background: #f3f4f6;
          border: 1px dashed #d1d5db;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          margin-bottom: 1.5rem;
        }
        .btn-add:hover {
          background: #e5e7eb;
        }
        .step-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        .btn-primary {
          background: #6366f1;
          color: white;
        }
        .btn-primary:hover {
          background: #4f46e5;
        }
        .btn-primary:disabled {
          background: #c7d2fe;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .alert {
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }
        .alert-error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .onboarding-result {
          max-width: 500px;
          margin: 2rem auto;
          text-align: center;
        }
        .result-card {
          padding: 2rem;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .result-card.approved {
          border: 2px solid #10b981;
        }
        .result-card.pending_review {
          border: 2px solid #f59e0b;
        }
        .result-card.rejected {
          border: 2px solid #ef4444;
        }
        .result-card h2 {
          margin-bottom: 1rem;
        }
        .score {
          font-size: 1.25rem;
          color: #6366f1;
          margin: 1rem 0;
        }
        .missing {
          text-align: left;
          background: #fef3c7;
          padding: 1rem;
          border-radius: 6px;
          margin-top: 1rem;
        }
        .missing h4 {
          margin-bottom: 0.5rem;
        }
        .missing ul {
          margin: 0;
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
}
