import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Ihr Weg aus der Schuldenfalle</h1>
          <p className="hero-subtitle">
            SchuldenKompass begleitet Sie mit persönlicher KI-Beratung, 
            praktischen Aufgaben und einem Schritt-für-Schritt Plan zu 
            finanzieller Freiheit.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-large btn-accent">
              Jetzt kostenlos starten
            </Link>
            <Link to="/login" className="btn btn-large btn-secondary">
              Anmelden
            </Link>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="hero-icon">🧭</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Warum SchuldenKompass?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>KI-Schuldenberater</h3>
            <p>
              Wählen Sie Ihren persönlichen Berater – ob strukturiert, 
              empathisch oder motivierend. Ihre Situation, Ihr Stil.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Praktische Aufgaben</h3>
            <p>
              Erhalten Sie passende Aufgaben basierend auf Ihren Fähigkeiten.
              Schritt für Schritt zu finanzieller Stabilität.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Fortschritt verfolgen</h3>
            <p>
              Sehen Sie Ihre Erfolge, sammeln Sie Punkte und bleiben Sie 
              motiviert auf Ihrem Weg aus den Schulden.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Datenschutz garantiert</h3>
            <p>
              Ihre Finanzdaten sind sicher und vertraulich. 
              DSGVO-konform und vollständig verschlüsselt.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>So funktioniert's</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Profil erstellen</h3>
            <p>Registrieren Sie sich kostenlos und fügen Sie Ihre Fähigkeiten hinzu.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Berater wählen</h3>
            <p>Wählen Sie einen KI-Berater, der zu Ihrem Stil passt.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Aufgaben erledigen</h3>
            <p>Erhalten Sie passende Aufgaben und sammeln Sie Punkte.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Schulden abbauen</h3>
            <p>Verfolgen Sie Ihren Fortschritt auf dem Weg zur finanziellen Freiheit.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Bereit, den ersten Schritt zu machen?</h2>
          <p>
            Tausende haben mit SchuldenKompass bereits den Weg aus der 
            Schuldenfalle gefunden. Starten Sie jetzt – kostenlos und unverbindlich.
          </p>
          <Link to="/register" className="btn btn-large btn-accent">
            Kostenlos registrieren
          </Link>
        </div>
      </section>
    </div>
  );
}
