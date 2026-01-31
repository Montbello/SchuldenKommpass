import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../api/auth';
import { setUser } from '../utils/auth';

export default function Register({ onAuth }: { onAuth: (user: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await register({ name, email, password });
      setUser(user);
      onAuth(user);
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, text: '', color: '' };
    if (password.length < 6) return { level: 1, text: 'Schwach', color: '#ef4444' };
    if (password.length < 10) return { level: 2, text: 'Mittel', color: '#f59e0b' };
    return { level: 3, text: 'Stark', color: '#22c55e' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🚀</div>
          <h2>Konto erstellen</h2>
          <p>Starten Sie Ihren Weg zur finanziellen Freiheit</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Ihr Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-Mail-Adresse</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              required
              autoComplete="new-password"
              minLength={6}
            />
            {password.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '4px'
                }}>
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: level <= strength.level ? strength.color : '#e2e8f0'
                      }}
                    />
                  ))}
                </div>
                <small style={{ color: strength.color }}>{strength.text}</small>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-accent btn-large" disabled={loading}>
            {loading ? 'Wird erstellt...' : 'Kostenlos registrieren'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Bereits registriert?{' '}
            <Link to="/login">Jetzt anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
