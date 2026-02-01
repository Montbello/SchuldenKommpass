import { useState } from 'react';
import EnhancedButton from '../components/EnhancedButton';
import FloatingLabelInput from '../components/FloatingLabelInput';
import Modal from '../components/Modal';
import { ToastContainer, useToast } from '../components/Toast';
import './UIShowcase.css';

/**
 * UI Showcase Page - Demonstration of Enhanced Components
 * 
 * This page demonstrates the UI/UX capabilities with interactive examples
 * of multiple modern components.
 */
export default function UIShowcase() {
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Toast hook
  const toast = useToast();

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  const handleAsyncAction = async () => {
    setLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setClickCount(prev => prev + 1);
    toast.success('Async Aktion erfolgreich abgeschlossen!');
  };

  const validateEmail = (value: string) => {
    if (value && !value.includes('@')) {
      setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      toast.error('Bitte korrigieren Sie die Fehler im Formular');
      return;
    }
    toast.success('Formular erfolgreich abgesendet!', 3000);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="ui-showcase">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      
      <div className="showcase-container">
        <header className="showcase-header">
          <h1>🎨 UI/UX Component Showcase</h1>
          <p className="showcase-subtitle">
            Vollständige Demonstration moderner Frontend-Komponenten mit React & TypeScript
          </p>
        </header>

        {/* Enhanced Button Section */}
        <section className="showcase-section">
          <h2>1. Enhanced Button mit Ripple-Effekt</h2>
          <p>Moderne, interaktive Buttons mit Material Design Ripple-Effekt und Ladeanimationen.</p>

          <div className="showcase-grid">
            {/* Variants */}
            <div className="demo-group">
              <h3>Varianten</h3>
              <div className="demo-buttons">
                <EnhancedButton variant="primary" onClick={handleClick}>
                  Primary Button
                </EnhancedButton>
                <EnhancedButton variant="accent" onClick={handleClick}>
                  Accent Button
                </EnhancedButton>
                <EnhancedButton variant="secondary" onClick={handleClick}>
                  Secondary Button
                </EnhancedButton>
              </div>
            </div>

            {/* Sizes */}
            <div className="demo-group">
              <h3>Größen</h3>
              <div className="demo-buttons">
                <EnhancedButton size="small" onClick={handleClick}>
                  Klein
                </EnhancedButton>
                <EnhancedButton size="medium" onClick={handleClick}>
                  Mittel
                </EnhancedButton>
                <EnhancedButton size="large" onClick={handleClick}>
                  Groß
                </EnhancedButton>
              </div>
            </div>

            {/* With Icons */}
            <div className="demo-group">
              <h3>Mit Icons</h3>
              <div className="demo-buttons">
                <EnhancedButton variant="primary" icon="🚀" onClick={handleClick}>
                  Jetzt starten
                </EnhancedButton>
                <EnhancedButton variant="accent" icon="💾" onClick={handleClick}>
                  Speichern
                </EnhancedButton>
                <EnhancedButton variant="secondary" icon="📊" onClick={handleClick}>
                  Statistiken
                </EnhancedButton>
              </div>
            </div>

            {/* States */}
            <div className="demo-group">
              <h3>Zustände</h3>
              <div className="demo-buttons">
                <EnhancedButton variant="primary" loading={loading} onClick={handleAsyncAction}>
                  {loading ? 'Lädt...' : 'Async Action'}
                </EnhancedButton>
                <EnhancedButton variant="accent" disabled>
                  Deaktiviert
                </EnhancedButton>
                <EnhancedButton variant="secondary" icon="✓" onClick={handleClick}>
                  Erfolg
                </EnhancedButton>
              </div>
            </div>
          </div>

          {/* Click Counter */}
          <div className="click-counter">
            <div className="counter-badge">
              <span className="counter-icon">👆</span>
              <div className="counter-info">
                <span className="counter-label">Button Clicks</span>
                <span className="counter-value">{clickCount}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Label Input Section */}
        <section className="showcase-section">
          <h2>2. Floating Label Inputs</h2>
          <p>Moderne Input-Felder mit animierten Labels und Validierung.</p>

          <form className="demo-form" onSubmit={handleFormSubmit}>
            <div className="form-row">
              <FloatingLabelInput
                label="Vollständiger Name"
                value={name}
                onChange={setName}
                icon="👤"
                required
              />
            </div>
            
            <div className="form-row">
              <FloatingLabelInput
                label="E-Mail-Adresse"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={emailError}
                icon="📧"
                required
              />
            </div>
            
            <div className="form-row">
              <FloatingLabelInput
                label="Passwort"
                type="password"
                value={password}
                onChange={setPassword}
                icon="🔒"
                required
              />
            </div>

            <EnhancedButton 
              type="submit" 
              variant="primary" 
              size="large"
              icon="✓"
            >
              Formular absenden
            </EnhancedButton>
          </form>
        </section>

        {/* Toast Notification Section */}
        <section className="showcase-section">
          <h2>3. Toast Notifications</h2>
          <p>Elegante Benachrichtigungen für Benutzer-Feedback.</p>

          <div className="toast-demo-grid">
            <EnhancedButton 
              variant="primary" 
              icon="✓"
              onClick={() => toast.success('Das ist eine Erfolgs-Nachricht!')}
            >
              Erfolg anzeigen
            </EnhancedButton>
            
            <EnhancedButton 
              variant="accent" 
              icon="ℹ"
              onClick={() => toast.info('Das ist eine Info-Nachricht!')}
            >
              Info anzeigen
            </EnhancedButton>
            
            <EnhancedButton 
              variant="secondary" 
              icon="⚠"
              onClick={() => toast.warning('Das ist eine Warnung!')}
            >
              Warnung anzeigen
            </EnhancedButton>
            
            <EnhancedButton 
              variant="secondary" 
              icon="✕"
              onClick={() => toast.error('Das ist eine Fehler-Nachricht!')}
            >
              Fehler anzeigen
            </EnhancedButton>
          </div>
        </section>

        {/* Modal Section */}
        <section className="showcase-section">
          <h2>4. Modal/Dialog</h2>
          <p>Overlay-Dialoge für wichtige Aktionen und Informationen.</p>

          <div className="modal-demo-grid">
            <EnhancedButton 
              variant="primary"
              onClick={() => {
                setModalSize('small');
                setIsModalOpen(true);
              }}
            >
              Kleines Modal
            </EnhancedButton>
            
            <EnhancedButton 
              variant="accent"
              onClick={() => {
                setModalSize('medium');
                setIsModalOpen(true);
              }}
            >
              Mittleres Modal
            </EnhancedButton>
            
            <EnhancedButton 
              variant="secondary"
              onClick={() => {
                setModalSize('large');
                setIsModalOpen(true);
              }}
            >
              Großes Modal
            </EnhancedButton>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Beispiel Modal-Dialog"
            size={modalSize}
            footer={
              <>
                <EnhancedButton 
                  variant="secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Abbrechen
                </EnhancedButton>
                <EnhancedButton 
                  variant="primary"
                  onClick={() => {
                    setIsModalOpen(false);
                    toast.success('Aktion bestätigt!');
                  }}
                >
                  Bestätigen
                </EnhancedButton>
              </>
            }
          >
            <p>
              Dies ist ein Beispiel für einen Modal-Dialog. Sie können hier wichtige
              Informationen anzeigen oder Benutzeraktionen bestätigen lassen.
            </p>
            <p>
              Features:
            </p>
            <ul>
              <li>✅ Keyboard-Support (ESC zum Schließen)</li>
              <li>✅ Backdrop mit Blur-Effekt</li>
              <li>✅ Focus-Management</li>
              <li>✅ Responsive für Mobile</li>
              <li>✅ Animierte Übergänge</li>
            </ul>
          </Modal>
        </section>

        {/* Features Section */}
        <section className="showcase-section">
          <h2>✨ Component Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Material Design</h3>
              <p>Moderne UI-Patterns wie Ripple-Effekte und Animationen</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Performance</h3>
              <p>GPU-beschleunigte Animationen für 60 FPS</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">♿</div>
              <h3>Accessibility</h3>
              <p>WCAG-konform mit Keyboard-Navigation</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3>Responsive</h3>
              <p>Touch-optimiert für alle Geräte</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <h3>Themeable</h3>
              <p>CSS-Variablen für einfache Anpassung</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Type-Safe</h3>
              <p>Vollständig mit TypeScript typisiert</p>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="showcase-footer">
          <EnhancedButton 
            variant="secondary" 
            icon="🏠"
            onClick={() => window.location.href = '/'}
          >
            Zurück zur Startseite
          </EnhancedButton>
        </div>
      </div>
    </div>
  );
}
