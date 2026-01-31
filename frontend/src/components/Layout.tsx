import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../types';
import { clearToken } from '../utils/auth';
import { logout } from '../api/auth';
import CookieConsent from './CookieConsent';
import BottomNav from './BottomNav';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore logout errors
    }
    clearToken();
    onLogout();
    navigate('/login');
  }

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-container">
      {/* Skip-Link für Barrierefreiheit */}
      <a href="#main-content" className="skip-link">
        Zum Inhalt springen
      </a>

      <header className="app-header" role="banner">
        <div className="header-left">
          <Link to="/" className="logo-link" aria-label="SchuldenKompass - Zur Startseite">
            <span className="logo-icon">🧭</span>
            <h1>SchuldenKompass</h1>
          </Link>
        </div>
        
        <nav className="main-nav" role="navigation" aria-label="Hauptnavigation">
          {user ? (
            <>
              <Link to="/" className={isActive('/')}>Dashboard</Link>
              <Link to="/chat" className={isActive('/chat')}>Berater</Link>
              <Link to="/tasks" className={isActive('/tasks')}>Aufgaben</Link>
              <Link to="/matches" className={isActive('/matches')}>Matches</Link>
              <Link to="/progress" className={isActive('/progress')}>Fortschritt</Link>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/register" className={isActive('/register')}>Registrieren</Link>
            </>
          )}
        </nav>

        <div className="header-right">
          {user && (
            <>
              <span className="user-greeting">Hallo, {user.name || user.email}</span>
              <button onClick={handleLogout} className="btn-logout" aria-label="Ausloggen">
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <main id="main-content" className="app-main" role="main">
        <Outlet />
      </main>

      <footer className="app-footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-main">
            <p>&copy; 2026 SchuldenKompass. Alle Rechte vorbehalten.</p>
          </div>
          
          <nav className="footer-nav" aria-label="Fußzeilen-Navigation">
            <div className="footer-links">
              <Link to="/impressum">Impressum</Link>
              <Link to="/datenschutz">Datenschutz</Link>
              <Link to="/agb">AGB</Link>
              <Link to="/kontakt">Kontakt</Link>
            </div>
          </nav>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      {user && <BottomNav />}

      <CookieConsent />
    </div>
  );
}
