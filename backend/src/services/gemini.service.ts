import { config } from '../config';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ReportInput {
  userName: string;
  userStory: string;
  progress: {
    taskTitle: string;
    status: string;
    points: number;
    completedAt?: string;
  }[];
  documents: {
    type: string;
    description?: string;
    uploadedAt: string;
  }[];
  totalPoints: number;
}

export interface GeneratedReport {
  summary: string;
  recommendations: string[];
  statusAssessment: string;
  nextSteps: string[];
  rawContent: string;
}

const REPORT_PROMPT = `Du bist ein Sachbearbeiter-Assistent für deutsche Jobcenter und Schuldnerberatungsstellen.

Erstelle einen sachlichen, professionellen Statusbericht für Behörden basierend auf den folgenden Daten eines Teilnehmers.

Der Bericht soll:
- Objektiv und faktenbasiert sein
- Die Fortschritte des Teilnehmers klar dokumentieren
- Für Sachbearbeiter im Jobcenter verständlich sein
- Empfehlungen für weitere Maßnahmen enthalten

Antworte im folgenden JSON-Format:
{
  "summary": "Kurze Zusammenfassung des Gesamtstatus (2-3 Sätze)",
  "statusAssessment": "Detaillierte Bewertung des aktuellen Stands",
  "recommendations": ["Empfehlung 1", "Empfehlung 2"],
  "nextSteps": ["Nächster Schritt 1", "Nächster Schritt 2"]
}

Teilnehmerdaten:
`;

export const geminiService = {
  async generateReport(input: ReportInput): Promise<GeneratedReport> {
    const participantData = `
Name: ${input.userName}

Persönliche Situation:
${input.userStory}

Absolvierte Maßnahmen (${input.progress.length} Aufgaben, ${input.totalPoints} Punkte):
${input.progress.map(p => `- ${p.taskTitle}: ${p.status} (${p.points} Punkte)${p.completedAt ? ` - abgeschlossen am ${p.completedAt}` : ''}`).join('\n')}

Eingereichte Nachweise (${input.documents.length} Dokumente):
${input.documents.map(d => `- ${d.type}${d.description ? `: ${d.description}` : ''} (hochgeladen: ${d.uploadedAt})`).join('\n')}
`;

    const fullPrompt = REPORT_PROMPT + participantData;

    const response = await fetch(`${GEMINI_API_URL}?key=${config.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON from response
    let parsed: Partial<GeneratedReport> = {};
    try {
      // Extract JSON from markdown code block if present
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        parsed = JSON.parse(jsonStr);
      }
    } catch {
      // If parsing fails, use raw content
      parsed = {
        summary: rawContent.substring(0, 200),
        statusAssessment: rawContent,
        recommendations: [],
        nextSteps: [],
      };
    }

    return {
      summary: parsed.summary || 'Bericht erstellt',
      statusAssessment: parsed.statusAssessment || rawContent,
      recommendations: parsed.recommendations || [],
      nextSteps: parsed.nextSteps || [],
      rawContent,
    };
  },
};
