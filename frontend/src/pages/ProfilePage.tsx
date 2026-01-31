import { useState, useEffect } from 'react';
import type { User, Skill } from '../types';
import { updateUser, addSkill, deleteSkill, getUserSkills } from '../api/users';

interface ProfilePageProps {
  user: User;
  onUpdate: (user: User) => void;
}

// Skill categories for selection
const SKILL_CATEGORIES = [
  'Handwerk',
  'IT & Computer',
  'Büro & Verwaltung',
  'Pflege & Soziales',
  'Gastronomie',
  'Logistik & Lager',
  'Reinigung',
  'Garten & Landschaft',
  'Verkauf',
  'Sonstiges',
];

export default function ProfilePage({ user, onUpdate }: ProfilePageProps) {
  const [name, setName] = useState(user.name || '');
  const [consent, setConsent] = useState(user.consent_data_sharing || false);
  const [skills, setSkills] = useState<Skill[]>(user.skills || []);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await getUserSkills(user.user_id);
        setSkills(data);
      } catch {
        // Skills might be included in user object already
      }
    }
    if (!user.skills?.length) {
      loadSkills();
    }
  }, [user.user_id, user.skills]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateUser(user.user_id, {
        name,
        consent_data_sharing: consent,
      });
      onUpdate({ ...updated, skills });
      setSuccess('Profil erfolgreich gespeichert!');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSkill() {
    if (!newCategory) return;
    setError(null);

    try {
      const skill = await addSkill({
        category: newCategory,
        description: newDescription || undefined,
      });
      setSkills([...skills, skill]);
      setNewCategory('');
      setNewDescription('');
      setSuccess('Skill hinzugefügt!');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Hinzufügen');
    }
  }

  async function handleDeleteSkill(skillId: string) {
    try {
      await deleteSkill(skillId);
      setSkills(skills.filter(s => s.skill_id !== skillId));
      setSuccess('Skill entfernt!');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen');
    }
  }

  return (
    <div className="profile-page">
      <h2>Mein Profil</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSaveProfile} className="profile-form">
        <section className="form-section">
          <h3>Persönliche Daten</h3>
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Dein Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input id="email" type="email" value={user.email} disabled />
            <small>E-Mail kann nicht geändert werden</small>
          </div>
        </section>

        <section className="form-section">
          <h3>Datenschutz & Einwilligung</h3>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
              />
              <span>
                Ich stimme der Weitergabe meiner Daten an Partner zu, um passende 
                Aufgaben und Jobs zu finden. (DSGVO-konform, jederzeit widerrufbar)
              </span>
            </label>
          </div>

          {!consent && (
            <div className="alert alert-info">
              <strong>Hinweis:</strong> Ohne Einwilligung können wir dir keine 
              passenden Aufgaben vorschlagen.
            </div>
          )}
        </section>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Speichern...' : 'Profil speichern'}
        </button>
      </form>

      <section className="skills-section">
        <h3>Meine Skills</h3>
        <p>Füge deine Fähigkeiten hinzu, um passende Aufgaben zu finden.</p>

        <div className="skills-list">
          {skills.length === 0 ? (
            <p className="no-skills">Noch keine Skills hinzugefügt.</p>
          ) : (
            skills.map(skill => (
              <div key={skill.skill_id} className="skill-item">
                <div className="skill-info">
                  <strong>{skill.category}</strong>
                  {skill.description && <p>{skill.description}</p>}
                  {skill.verified && <span className="badge badge-verified">✓ Verifiziert</span>}
                </div>
                <button
                  onClick={() => handleDeleteSkill(skill.skill_id)}
                  className="btn btn-danger btn-small"
                >
                  Entfernen
                </button>
              </div>
            ))
          )}
        </div>

        <div className="add-skill-form">
          <h4>Neuen Skill hinzufügen</h4>
          
          <div className="form-group">
            <label htmlFor="skillCategory">Kategorie</label>
            <select
              id="skillCategory"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            >
              <option value="">-- Kategorie wählen --</option>
              {SKILL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="skillDescription">Beschreibung (optional)</label>
            <textarea
              id="skillDescription"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="z.B. 3 Jahre Erfahrung als Schreiner..."
              rows={2}
            />
          </div>

          <button
            type="button"
            onClick={handleAddSkill}
            className="btn btn-secondary"
            disabled={!newCategory}
          >
            Skill hinzufügen
          </button>
        </div>
      </section>
    </div>
  );
}
