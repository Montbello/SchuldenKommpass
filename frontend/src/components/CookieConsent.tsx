import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'sk_cookie_consent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShowBanner(false);
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie-Einwilligung">
      <div className="cookie-content">
        <p>
          Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten.
          Essentielle Cookies sind für die Grundfunktionen erforderlich.
          Weitere Informationen finden Sie in unserer{' '}
          <Link to="/datenschutz">Datenschutzerklärung</Link>.
        </p>
        <div className="cookie-actions">
          <button onClick={handleAccept} className="btn btn-primary">
            Alle akzeptieren
          </button>
          <button onClick={handleDecline} className="btn btn-secondary">
            Nur essenzielle
          </button>
        </div>
      </div>
    </div>
  );
}
