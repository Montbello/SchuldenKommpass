"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronLeft, Loader2, ShieldCheck } from "lucide-react"

interface FormData {
  situation: string
  name: string
  birthDate: string
  debtRange: string
  consent: boolean
}

const DEBT_RANGES = [
  { value: "unter-5000", label: "Unter 5.000 €" },
  { value: "5000-10000", label: "5.000 € - 10.000 €" },
  { value: "10000-25000", label: "10.000 € - 25.000 €" },
  { value: "25000-50000", label: "25.000 € - 50.000 €" },
  { value: "50000-100000", label: "50.000 € - 100.000 €" },
  { value: "ueber-100000", label: "Über 100.000 €" },
  { value: "unbekannt", label: "Ich bin mir nicht sicher" },
]

const STEPS = [
  { id: 1, title: "Ihre Situation", description: "Beschreiben Sie Ihre aktuelle Lage" },
  { id: 2, title: "Persönliche Daten", description: "Kurze Angaben zu Ihrer Person" },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    situation: "",
    name: "",
    birthDate: "",
    debtRange: "",
    consent: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.situation.trim()) {
      newErrors.situation = "Bitte beschreiben Sie Ihre Situation"
    } else if (formData.situation.trim().length < 20) {
      newErrors.situation = "Bitte geben Sie etwas mehr Details an (mindestens 20 Zeichen)"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.name.trim()) {
      newErrors.name = "Bitte geben Sie Ihren Namen ein"
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "Bitte geben Sie Ihr Geburtsdatum ein"
    }
    if (!formData.debtRange) {
      newErrors.debtRange = "Bitte wählen Sie einen Bereich"
    }
    if (!formData.consent) {
      newErrors.consent = "Bitte stimmen Sie der Datenweitergabe zu"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    // In a real app, you would redirect to the next page or show a success message
    alert("Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.")
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8" role="navigation" aria-label="Fortschritt">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    currentStep >= step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  )}
                  aria-current={currentStep === step.id ? "step" : undefined}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 mt-[-1.5rem]",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
        <p className="sr-only">
          Schritt {currentStep} von {STEPS.length}: {STEPS[currentStep - 1].title}
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-foreground">
            {currentStep === 1 ? "Beschreiben Sie Ihre Situation" : "Persönliche Angaben"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {currentStep === 1
              ? "Nehmen Sie sich Zeit, Ihre aktuelle finanzielle Situation zu schildern. Alle Angaben werden vertraulich behandelt."
              : "Diese Angaben helfen uns, Sie besser zu beraten und mit den zuständigen Stellen zu koordinieren."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Situation Description */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="situation" className="text-sm font-medium text-foreground">
                  Ihre Situation <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(Pflichtfeld)</span>
                </Label>
                <Textarea
                  id="situation"
                  value={formData.situation}
                  onChange={(e) => updateFormData("situation", e.target.value)}
                  placeholder="Beschreiben Sie hier Ihre finanzielle Situation. Zum Beispiel: Wie ist es zu den Schulden gekommen? Welche Gläubiger gibt es? Wie hoch sind die monatlichen Belastungen? Welche Unterstützung benötigen Sie?"
                  className={cn(
                    "min-h-[200px] resize-none bg-card text-foreground placeholder:text-muted-foreground/70",
                    errors.situation && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-required="true"
                  aria-invalid={!!errors.situation}
                  aria-describedby={errors.situation ? "situation-error" : "situation-hint"}
                />
                {errors.situation ? (
                  <p id="situation-error" className="text-sm text-destructive" role="alert">
                    {errors.situation}
                  </p>
                ) : (
                  <p id="situation-hint" className="text-sm text-muted-foreground">
                    Je detaillierter Ihre Beschreibung, desto besser können wir Ihnen helfen.
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/60">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Ihre Angaben werden verschlüsselt übertragen und gemäß DSGVO verarbeitet. 
                  Nur autorisierte Berater haben Zugriff auf Ihre Daten.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Vollständiger Name <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(Pflichtfeld)</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Max Mustermann"
                  className={cn(
                    "bg-card text-foreground",
                    errors.name && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium text-foreground">
                  Geburtsdatum <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(Pflichtfeld)</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateFormData("birthDate", e.target.value)}
                  className={cn(
                    "bg-card text-foreground",
                    errors.birthDate && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-required="true"
                  aria-invalid={!!errors.birthDate}
                  aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
                />
                {errors.birthDate && (
                  <p id="birthDate-error" className="text-sm text-destructive" role="alert">
                    {errors.birthDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="debtRange" className="text-sm font-medium text-foreground">
                  Geschätzte Schuldenhöhe <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(Pflichtfeld)</span>
                </Label>
                <Select
                  value={formData.debtRange}
                  onValueChange={(value) => updateFormData("debtRange", value)}
                >
                  <SelectTrigger
                    id="debtRange"
                    className={cn(
                      "bg-card text-foreground",
                      errors.debtRange && "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-required="true"
                    aria-invalid={!!errors.debtRange}
                    aria-describedby={errors.debtRange ? "debtRange-error" : "debtRange-hint"}
                  >
                    <SelectValue placeholder="Bitte wählen Sie einen Bereich" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEBT_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.debtRange ? (
                  <p id="debtRange-error" className="text-sm text-destructive" role="alert">
                    {errors.debtRange}
                  </p>
                ) : (
                  <p id="debtRange-hint" className="text-sm text-muted-foreground">
                    Eine ungefähre Schätzung reicht aus. Der genaue Betrag wird später ermittelt.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <div
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border",
                    errors.consent ? "border-destructive bg-destructive/5" : "border-border/60 bg-muted/30"
                  )}
                >
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => updateFormData("consent", checked === true)}
                    className="mt-0.5"
                    aria-required="true"
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? "consent-error" : "consent-description"}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="consent"
                      className="text-sm font-medium text-foreground cursor-pointer leading-relaxed"
                    >
                      Ich stimme der Datenweitergabe an Behörden zu{" "}
                      <span className="text-destructive" aria-hidden="true">*</span>
                      <span className="sr-only">(Pflichtfeld)</span>
                    </Label>
                    <p id="consent-description" className="text-xs text-muted-foreground leading-relaxed">
                      Ich erkläre mich einverstanden, dass meine Angaben an das zuständige Jobcenter 
                      und ggf. weitere Behörden zur Bearbeitung meines Anliegens weitergegeben werden dürfen. 
                      Diese Einwilligung kann jederzeit widerrufen werden.
                    </p>
                    {errors.consent && (
                      <p id="consent-error" className="text-sm text-destructive" role="alert">
                        {errors.consent}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "gap-2",
                currentStep === 1 && "invisible"
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Zurück
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="gap-2 min-w-[140px]"
              >
                Weiter
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    Absenden
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step Indicator for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {currentStep === 1 ? "Schritt 1: Beschreiben Sie Ihre Situation" : "Schritt 2: Persönliche Angaben"}
      </div>
    </div>
  )
}
