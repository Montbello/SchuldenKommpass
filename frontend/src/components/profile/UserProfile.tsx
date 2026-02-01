import { useState, useEffect } from 'react';

interface UserProfile {
  user_id: string;
  name: string | null;
  email: string;
  date_of_birth: string | null;
  role: string;
  status: string;
  onboarding_status: string;
  level: number;
  total_points: number;
  created_at: string;
  skills: Array<{
    skill_id: string;
    category: string;
    description: string | null;
    verified: boolean;
  }>;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
  });
  const [newSkill, setNewSkill] = useState({ category: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        date_of_birth: data.date_of_birth || '',
      });
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const addSkill = async () => {
    if (!newSkill.category) return;

    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newSkill),
      });

      if (response.ok) {
        await fetchProfile();
        setNewSkill({ category: '', description: '' });
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  if (loading || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Lädt Profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mein Profil</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Bearbeiten
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
            {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.name || profile.email}</h2>
            <p className="opacity-90">{profile.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                Level {profile.level}
              </span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                {profile.total_points} Punkte
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Grundinformationen</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p className="text-gray-700">{profile.name || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <p className="text-gray-700">{profile.email}</p>
            <p className="text-xs text-gray-500 mt-1">E-Mail kann nicht geändert werden</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Geburtsdatum</label>
            {isEditing ? (
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            ) : (
              <p className="text-gray-700">
                {profile.date_of_birth
                  ? new Date(profile.date_of_birth).toLocaleDateString('de-DE')
                  : '-'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <p className="text-gray-700">{profile.status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rolle</label>
              <p className="text-gray-700">{profile.role}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Onboarding-Status</label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                profile.onboarding_status === 'APPROVED'
                  ? 'bg-green-100 text-green-800'
                  : profile.onboarding_status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {profile.onboarding_status}
            </span>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: profile.name || '',
                    date_of_birth: profile.date_of_birth || '',
                  });
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Abbrechen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Meine Fähigkeiten</h3>

        {profile.skills.length === 0 ? (
          <p className="text-gray-500 mb-4">Noch keine Fähigkeiten hinzugefügt</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {profile.skills.map((skill) => (
              <div key={skill.skill_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{skill.category}</h4>
                  {skill.verified && (
                    <span className="text-green-600 text-sm">✓ Verifiziert</span>
                  )}
                </div>
                {skill.description && (
                  <p className="text-sm text-gray-600">{skill.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Skill */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Neue Fähigkeit hinzufügen</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Fähigkeit"
              className="flex-1 px-3 py-2 border rounded-md"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            />
            <input
              type="text"
              placeholder="Beschreibung (optional)"
              className="flex-1 px-3 py-2 border rounded-md"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
            />
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Account-Informationen</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Account erstellt am: {new Date(profile.created_at).toLocaleDateString('de-DE')}</p>
          <p>User ID: {profile.user_id}</p>
        </div>
      </div>
    </div>
  );
}
