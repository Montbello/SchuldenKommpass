import { useState } from 'react';
import EnhancedButton from '../components/EnhancedButton';
import './UIShowcase.css';

/**
 * UI Showcase Page - Demonstration of Enhanced Components
 * 
 * This page demonstrates the UI/UX capabilities with interactive examples
 * of the EnhancedButton component with various configurations.
 */
export default function UIShowcase() {
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  const handleAsyncAction = async () => {
    setLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="ui-showcase">
      <div className="showcase-container">
        <header className="showcase-header">
          <h1>🎨 UI/UX Capabilities Showcase</h1>
          <p className="showcase-subtitle">
            Demonstration moderner Frontend-Komponenten mit React & TypeScript
          </p>
        </header>

        {/* Enhanced Button Section */}
        <section className="showcase-section">
          <h2>Enhanced Button mit Ripple-Effekt</h2>
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

        {/* Features Section */}
        <section className="showcase-section">
          <h2>✨ Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Ripple Effect</h3>
              <p>Material Design Ripple-Animation beim Klick</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Performance</h3>
              <p>Optimierte Animationen mit CSS transforms</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">♿</div>
              <h3>Accessibility</h3>
              <p>WCAG-konform mit Keyboard-Navigation</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3>Responsive</h3>
              <p>Touch-optimiert für mobile Geräte</p>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="showcase-section">
          <h2>💻 Code Beispiel</h2>
          <div className="code-block">
            <pre><code>{`import EnhancedButton from './components/EnhancedButton';

function MyComponent() {
  const handleSubmit = async () => {
    // Your async logic here
  };

  return (
    <EnhancedButton 
      variant="primary"
      size="large"
      icon="🚀"
      onClick={handleSubmit}
    >
      Jetzt starten
    </EnhancedButton>
  );
}`}</code></pre>
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
