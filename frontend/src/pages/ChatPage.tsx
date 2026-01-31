import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { User, AdvisorType, ChatMessage } from '../types';

interface ChatPageProps {
  user: User;
}

const advisorInfo: Record<AdvisorType, { name: string; emoji: string; greeting: string }> = {
  structured: {
    name: 'Der Strukturierte',
    emoji: '📊',
    greeting: 'Guten Tag! Ich bin Ihr strukturierter Finanzberater. Lassen Sie uns gemeinsam einen klaren Plan erstellen, um Ihre Schulden systematisch abzubauen. Wie kann ich Ihnen heute helfen?',
  },
  empathetic: {
    name: 'Der Empathische',
    emoji: '💚',
    greeting: 'Hallo! Ich freue mich, dass Sie hier sind. Schulden können belastend sein, aber Sie sind nicht allein. Ich bin hier, um Sie zu unterstützen. Was beschäftigt Sie gerade am meisten?',
  },
  motivator: {
    name: 'Der Motivator',
    emoji: '🚀',
    greeting: 'Hey! Großartig, dass Sie den ersten Schritt gemacht haben! 🎉 Jeder Weg beginnt mit einem einzelnen Schritt, und Sie sind auf dem richtigen Weg. Worauf möchten Sie sich heute konzentrieren?',
  },
};

const quickReplies = [
  'Wie erstelle ich einen Budgetplan?',
  'Welche Aufgaben passen zu mir?',
  'Zeig mir meinen Fortschritt',
  'Tipps zum Schuldenabbau',
];

export default function ChatPage({ user }: ChatPageProps) {
  const advisorType = user.selected_advisor || 'empathetic';
  const advisor = advisorInfo[advisorType];
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'advisor',
      content: advisor.greeting,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(messageText?: string) {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (in real app, call backend API)
    setTimeout(() => {
      const responses = getSimulatedResponse(text, advisorType);
      const advisorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'advisor',
        content: responses,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, advisorMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-advisor-info">
          <div className="advisor-avatar-small">{advisor.emoji}</div>
          <div>
            <h3>{advisor.name}</h3>
            <span className="advisor-status">Online</span>
          </div>
        </div>
        <Link to="/advisor" className="btn btn-secondary btn-small">
          Berater wechseln
        </Link>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.role === 'user' ? 'user' : 'advisor'}`}
          >
            {message.role === 'advisor' && (
              <div className="message-avatar">{advisor.emoji}</div>
            )}
            <div className="message-bubble">
              <p>{message.content}</p>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="chat-message advisor">
            <div className="message-avatar">{advisor.emoji}</div>
            <div className="message-bubble typing">
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-quick-replies">
        {quickReplies.map((reply, index) => (
          <button
            key={index}
            className="quick-reply-btn"
            onClick={() => handleSend(reply)}
          >
            {reply}
          </button>
        ))}
      </div>

      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Schreiben Sie Ihre Nachricht..."
          rows={1}
          className="chat-input"
        />
        <button
          className="btn btn-primary btn-icon send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// Simulated responses based on advisor type
function getSimulatedResponse(input: string, advisorType: AdvisorType): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('budget') || lowerInput.includes('plan')) {
    const responses: Record<AdvisorType, string> = {
      structured: 'Ein guter Budgetplan ist das Fundament. Hier ist mein Vorschlag:\n\n1. Listen Sie alle Einnahmen auf\n2. Kategorisieren Sie Ihre Ausgaben\n3. Setzen Sie klare Limits pro Kategorie\n4. Planen Sie 20% für Schuldenabbau ein\n\nSoll ich Ihnen eine Vorlage erstellen?',
      empathetic: 'Ein Budget kann manchmal einschüchternd wirken, aber keine Sorge – wir gehen das gemeinsam durch. Fangen wir klein an: Was sind Ihre wichtigsten monatlichen Ausgaben? Zusammen finden wir Bereiche, wo wir anpassen können, ohne dass es wehtut.',
      motivator: 'Super, dass Sie einen Budgetplan erstellen wollen! 💪 Das ist ein riesiger Schritt! Wussten Sie, dass Menschen mit Budget 30% schneller schuldenfrei werden? Lassen Sie uns loslegen – ich zeige Ihnen einen einfachen 3-Schritte-Plan!',
    };
    return responses[advisorType];
  }
  
  if (lowerInput.includes('aufgabe') || lowerInput.includes('job')) {
    return 'Basierend auf Ihren Skills habe ich passende Aufgaben gefunden. Gehen Sie zu "Aufgaben" um die Matches zu sehen. Soll ich Ihnen Tipps geben, wie Sie Ihre Chancen verbessern können?';
  }
  
  if (lowerInput.includes('fortschritt') || lowerInput.includes('progress')) {
    return `Sie haben bereits ${Math.floor(Math.random() * 500) + 100} Punkte gesammelt! Das ist großartig. Auf der Fortschritts-Seite sehen Sie alle Details. Weiter so!`;
  }
  
  if (lowerInput.includes('schulden') || lowerInput.includes('abbau')) {
    const responses: Record<AdvisorType, string> = {
      structured: 'Für effektiven Schuldenabbau empfehle ich die Schneeball-Methode:\n\n1. Kleinste Schuld zuerst tilgen\n2. Minimumbeiträge für andere Schulden\n3. Nach Tilgung: Betrag zur nächsten Schuld addieren\n\nDies maximiert Ihre psychologischen Erfolge.',
      empathetic: 'Schuldenabbau ist ein Marathon, kein Sprint. Es ist völlig okay, sich manchmal überwältigt zu fühlen. Wichtig ist, dass Sie dranbleiben. Welche Schulden belasten Sie am meisten? Manchmal hilft es, dort anzufangen.',
      motivator: 'Schulden abbauen ist wie ein Videospiel – jede getilgte Schuld ist ein Level-Up! 🎮 Fangen Sie mit kleinen Siegen an und bauen Sie Momentum auf. Sie schaffen das! Was ist Ihre kleinste Schuld?',
    };
    return responses[advisorType];
  }
  
  // Default response
  const defaults: Record<AdvisorType, string> = {
    structured: 'Verstanden. Lassen Sie uns das systematisch angehen. Welches konkrete Ziel möchten Sie als nächstes erreichen?',
    empathetic: 'Danke, dass Sie das mit mir teilen. Wie fühlen Sie sich dabei? Gemeinsam finden wir eine Lösung, die für Sie funktioniert.',
    motivator: 'Das klingt nach einem guten Ansatz! Jeder Schritt vorwärts ist ein Gewinn. Was können wir heute konkret erreichen?',
  };
  return defaults[advisorType];
}
