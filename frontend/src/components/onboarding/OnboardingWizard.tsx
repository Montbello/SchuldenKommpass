import { useState } from 'react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  { id: 1, title: 'Basis', description: 'Grundlegende Informationen' },
  { id: 2, title: 'Nachweise', description: 'Dokumente hochladen' },
  { id: 3, title: 'Fähigkeiten', description: 'Ihre Kompetenzen' },
  { id: 4, title: 'Story', description: 'Ihre Geschichte' },
];

interface OnboardingData {
  // Step 1: Basis
  name?: string;
  dateOfBirth?: string;
  referredBy?: string;
  // Step 2: Nachweise
  documents?: File[];
  // Step 3: Fähigkeiten
  skills?: string[];
  // Step 4: Story
  userStory?: string;
  consentDataProcessing?: boolean;
  consentDataSharing?: boolean;
  consentPartnerSharing?: boolean;
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      setFormData({ ...formData, documents: [...uploadedFiles, ...newFiles] });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setFormData({ ...formData, documents: newFiles });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setFormData({ ...formData, skills: newSkills });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Onboarding erfolgreich abgeschlossen!');
      }
    } catch (error) {
      console.error('Fehler beim Onboarding:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Grundlegende Informationen</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ihr vollständiger Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Geburtsdatum</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Empfohlen durch</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.referredBy || ''}
                onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                placeholder="Organisation oder Person (optional)"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Nachweise hochladen</h3>
            <p className="text-sm text-gray-600">
              Laden Sie relevante Dokumente hoch (z.B. Ausweisdokumente, finanzielle Nachweise)
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700"
              >
                Dateien auswählen oder hierher ziehen
              </label>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Hochgeladene Dateien:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ihre Fähigkeiten</h3>
            <p className="text-sm text-gray-600">
              Welche beruflichen Fähigkeiten und Erfahrungen bringen Sie mit?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Fähigkeit eingeben..."
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Hinzufügen
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ihre Geschichte</h3>
            <p className="text-sm text-gray-600">
              Erzählen Sie uns kurz von Ihrer Situation und Ihren Zielen
            </p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
              value={formData.userStory || ''}
              onChange={(e) => setFormData({ ...formData, userStory: e.target.value })}
              placeholder="Ihre Geschichte..."
            />
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-medium">Einwilligungen</h4>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.consentDataProcessing || false}
                  onChange={(e) =>
                    setFormData({ ...formData, consentDataProcessing: e.target.checked })
                  }
                />
                <span className="text-sm">
                  Ich stimme der Datenverarbeitung zu
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.consentDataSharing || false}
                  onChange={(e) =>
                    setFormData({ ...formData, consentDataSharing: e.target.checked })
                  }
                />
                <span className="text-sm">
                  Ich stimme der Datenweitergabe zu
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.consentPartnerSharing || false}
                  onChange={(e) =>
                    setFormData({ ...formData, consentPartnerSharing: e.target.checked })
                  }
                />
                <span className="text-sm">
                  Ich stimme der Weitergabe an Partner zu
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Onboarding Wizard</h2>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id}
                </div>
                <div className="text-xs mt-1 text-center">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Zurück
        </button>
        {currentStep < steps.length ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Weiter
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Abschließen
          </button>
        )}
      </div>
    </div>
  );
}
