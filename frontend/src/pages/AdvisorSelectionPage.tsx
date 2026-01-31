import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AdvisorType } from '../types';

interface AdvisorSelectionPageProps {
  user: User;
  onSelectAdvisor: (advisorType: AdvisorType) => void;
}

interface Advisor {
  id: AdvisorType;
  name: string;
  title: string;
  description: string;
  traits: string[];
  emoji: string;
  color: string;
}

const advisors: Advisor[] = [
  {
    id: 'structured',
    name: 'Der Strukturierte',
    title: 'Budgetplaner',
    description: 'Klare Pläne, strikte Budgets. Ich helfe Ihnen mit System und Disziplin Ihre Schulden abzubauen.',
    traits: ['Detaillierte Budgetpläne', 'Klare Zeitvorgaben', 'Strenge Kontrolle'],
    emoji: '📊',
    color: '#2563eb',
  },
  {
    id: 'empathetic',
    name: 'Der Empathische',
    title: 'Verständnisvoller Begleiter',
    description: 'Ich verstehe, dass Schulden belastend sind. Gemeinsam finden wir einen Weg, der zu Ihrem Leben passt.',
    traits: ['Einfühlsame Beratung', 'Flexible Lösungen', 'Emotionale Unterstützung'],
    emoji: '💚',
    color: '#10b981',
  },
  {
    id: 'motivator',
    name: 'Der Motivator',
    title: 'Erfolgscoach',
    description: 'Jeder kleine Schritt zählt! Ich feiere Ihre Erfolge und pushe Sie zu finanzieller Freiheit.',
    traits: ['Positive Verstärkung', 'Meilenstein-Feiern', 'Motivierende Challenges'],
    emoji: '🚀',
    color: '#7c3aed',
  },
];

export default function AdvisorSelectionPage({ user, onSelectAdvisor }: AdvisorSelectionPageProps) {
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorType | null>(
    user.selected_advisor || null
  );
  const navigate = useNavigate();

  function handleSelect(advisorId: AdvisorType) {
    setSelectedAdvisor(advisorId);
  }

  function handleConfirm() {
    if (selectedAdvisor) {
      onSelectAdvisor(selectedAdvisor);
      navigate('/chat');
    }
  }

  return (
    <div className="advisor-selection-page animate-fade-in">
      <div className="advisor-header">
        <h2>Wählen Sie Ihren KI-Berater</h2>
        <p>Jeder Berater hat seinen eigenen Stil. Wählen Sie den, der am besten zu Ihnen passt.</p>
      </div>

      <div className="advisors-grid">
        {advisors.map((advisor) => (
          <div
            key={advisor.id}
            className={`advisor-card ${selectedAdvisor === advisor.id ? 'selected' : ''}`}
            onClick={() => handleSelect(advisor.id)}
            style={{ '--advisor-color': advisor.color } as React.CSSProperties}
          >
            <div className="advisor-emoji">{advisor.emoji}</div>
            <h3>{advisor.name}</h3>
            <span className="advisor-title">{advisor.title}</span>
            <p className="advisor-description">{advisor.description}</p>
            <ul className="advisor-traits">
              {advisor.traits.map((trait, index) => (
                <li key={index}>✓ {trait}</li>
              ))}
            </ul>
            {selectedAdvisor === advisor.id && (
              <div className="selected-badge">Ausgewählt</div>
            )}
          </div>
        ))}
      </div>

      <div className="advisor-actions">
        <button
          className="btn btn-large btn-primary"
          disabled={!selectedAdvisor}
          onClick={handleConfirm}
        >
          {selectedAdvisor ? 'Mit Berater starten' : 'Bitte wählen Sie einen Berater'}
        </button>
      </div>

      {user.selected_advisor && (
        <p className="current-advisor-info">
          Aktueller Berater: <strong>{advisors.find(a => a.id === user.selected_advisor)?.name}</strong>
          {' – '}Sie können jederzeit wechseln.
        </p>
      )}
    </div>
  );
}
