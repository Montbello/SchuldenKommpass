import { useState, useEffect } from 'react';

interface Certificate {
  certificate_id: string;
  title: string;
  description?: string;
  issued_date: string;
  signed_token?: string;
}

interface UnlockLevel {
  level: number;
  name: string;
  points_required: number;
  unlocked_features: string[];
}

const LEVELS: UnlockLevel[] = [
  { level: 1, name: 'Newcomer', points_required: 0, unlocked_features: ['basic_dashboard'] },
  { level: 2, name: 'Starter', points_required: 50, unlocked_features: ['task_accept'] },
  { level: 3, name: 'Aktiv', points_required: 150, unlocked_features: ['community_access'] },
  { level: 4, name: 'Engagiert', points_required: 300, unlocked_features: ['advisor_booking'] },
  { level: 5, name: 'Fortgeschritten', points_required: 500, unlocked_features: ['job_board_access'] },
  { level: 6, name: 'Erfahren', points_required: 750, unlocked_features: ['partner_offers'] },
  { level: 7, name: 'Expert', points_required: 1000, unlocked_features: ['mentoring_access'] },
  { level: 8, name: 'Champion', points_required: 1500, unlocked_features: ['priority_support'] },
  { level: 9, name: 'Master', points_required: 2000, unlocked_features: ['exclusive_events'] },
  { level: 10, name: 'Legend', points_required: 3000, unlocked_features: ['all_access'] },
];

export default function CertificateOverview() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [userProgress, setUserProgress] = useState({
    level: 1,
    total_points: 0,
    unlocked_features: [],
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [certsRes, progressRes] = await Promise.all([
        fetch('/api/certificates', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/certificates/progress', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      const certsData = await certsRes.json();
      const progressData = await progressRes.json();

      setCertificates(certsData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = LEVELS.find(l => l.level === userProgress.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === userProgress.level + 1);
  
  const progressToNextLevel = nextLevel
    ? ((userProgress.total_points - currentLevel.points_required) /
        (nextLevel.points_required - currentLevel.points_required)) * 100
    : 100;

  const showAchievementToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex items-center justify-center">
        <p className="text-gray-500">Lädt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Meine Zertifikate & Erfolge</h2>

      {/* Unlock Progress Section */}
      <UnlockProgressBar
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        totalPoints={userProgress.total_points}
        progress={progressToNextLevel}
      />

      {/* Certificates Grid */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Erhaltene Zertifikate</h3>
        {certificates.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">Noch keine Zertifikate erhalten</p>
            <p className="text-sm text-gray-400 mt-2">
              Sammle Punkte durch Aufgaben, um Zertifikate zu verdienen!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map(cert => (
              <CertificateBadge
                key={cert.certificate_id}
                certificate={cert}
                onView={() => showAchievementToast(`Zertifikat: ${cert.title}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Level Badges */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Level-Übersicht</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {LEVELS.map(level => {
            const isUnlocked = userProgress.level >= level.level;
            const isCurrent = userProgress.level === level.level;

            return (
              <div
                key={level.level}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50'
                    : isUnlocked
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isUnlocked
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {level.level}
                  </div>
                  <div className="font-semibold text-sm">{level.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {level.points_required} Punkte
                  </div>
                  {isCurrent && (
                    <div className="mt-2 text-xs text-blue-600 font-semibold">Aktuell</div>
                  )}
                  {isUnlocked && !isCurrent && (
                    <div className="mt-2 text-xs text-green-600">✓ Freigeschaltet</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Toast */}
      {showToast && <AchievementToast message={toastMessage} />}
    </div>
  );
}

function UnlockProgressBar({
  currentLevel,
  nextLevel,
  totalPoints,
  progress,
}: {
  currentLevel: UnlockLevel;
  nextLevel?: UnlockLevel;
  totalPoints: number;
  progress: number;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            Level {currentLevel.level}: {currentLevel.name}
          </h3>
          <p className="text-sm text-gray-600">{totalPoints} Punkte gesammelt</p>
        </div>
        {nextLevel && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Nächstes Level:</p>
            <p className="font-semibold">{nextLevel.name}</p>
          </div>
        )}
      </div>

      {nextLevel ? (
        <>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>{currentLevel.points_required} Punkte</span>
            <span>{Math.round(progress)}% zum nächsten Level</span>
            <span>{nextLevel.points_required} Punkte</span>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-lg text-center">
          <span className="text-xl font-bold">🏆 Maximales Level erreicht!</span>
        </div>
      )}

      {/* Unlocked Features */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm font-semibold mb-2">Freigeschaltete Features:</p>
        <div className="flex flex-wrap gap-2">
          {currentLevel.unlocked_features.map(feature => (
            <span
              key={feature}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs"
            >
              ✓ {feature.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CertificateBadge({
  certificate,
  onView,
}: {
  certificate: Certificate;
  onView: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-yellow-400 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
          🏅
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{certificate.title}</h4>
          <p className="text-xs text-gray-500">
            {new Date(certificate.issued_date).toLocaleDateString('de-DE')}
          </p>
        </div>
      </div>
      {certificate.description && (
        <p className="text-sm text-gray-600 mb-3">{certificate.description}</p>
      )}
      <button
        onClick={onView}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        Zertifikat anzeigen
      </button>
    </div>
  );
}

function AchievementToast({ message }: { message: string }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="font-semibold">Erfolg freigeschaltet!</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
