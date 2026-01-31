"use client"

import { useState } from "react"
import { StepWizard } from "@/components/step-wizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react"

const STEP_CONTENT = [
  {
    title: "Ihre Situation beschreiben",
    description: "Erzählen Sie uns von Ihrer aktuellen finanziellen Lage",
  },
  {
    title: "Nachweise hochladen",
    description: "Laden Sie relevante Dokumente und Belege hoch",
  },
  {
    title: "Fortschritt verfolgen",
    description: "Behalten Sie Ihre Aufgaben und Meilensteine im Blick",
  },
  {
    title: "Report erstellen",
    description: "Generieren Sie Ihren offiziellen Statusbericht",
  },
]

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const handleNext = () => {
    if (currentStep < 4) {
      setCompletedSteps((prev) => 
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      )
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleStepClick = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-semibold text-foreground">SchuldenKompass</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Step Wizard Navigation */}
        <div className="mb-8">
          <StepWizard
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Step Content */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              {STEP_CONTENT[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {STEP_CONTENT[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] flex items-center justify-center rounded-lg bg-muted/30 border border-dashed border-border">
              <p className="text-muted-foreground text-center">
                Inhalt für Schritt {currentStep}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Zurück
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 4}
                className="gap-2"
              >
                {currentStep === 4 ? "Abschließen" : "Weiter"}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
