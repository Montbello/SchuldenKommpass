"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowRight, Lock } from "lucide-react"

export function OnboardingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    debtAmount: "",
    situation: "",
    consent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConsentChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, consent: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    alert("Vielen Dank! Wir werden uns in Kürze bei Ihnen melden.")
  }

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.situation &&
    formData.consent

  return (
    <Card className="w-full max-w-2xl mx-auto border-border/60 shadow-lg">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            Erstgespräch starten
          </CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed text-muted-foreground">
          Alle Angaben werden vertraulich behandelt und gemäß DSGVO geschützt. 
          Wir sind hier, um Ihnen zu helfen – ohne Bewertung.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Vollständiger Name <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(Pflichtfeld)</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Max Mustermann"
              value={formData.name}
              onChange={handleInputChange}
              className="h-12 bg-card border-border focus:border-primary focus:ring-primary/20"
              aria-required="true"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              E-Mail-Adresse <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(Pflichtfeld)</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="max.mustermann@beispiel.de"
              value={formData.email}
              onChange={handleInputChange}
              className="h-12 bg-card border-border focus:border-primary focus:ring-primary/20"
              aria-required="true"
            />
          </div>

          {/* Debt Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="debtAmount" className="text-sm font-medium text-foreground">
              Schulden geschätzt
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="debtAmount"
                name="debtAmount"
                type="text"
                inputMode="numeric"
                placeholder="z.B. 15.000"
                value={formData.debtAmount}
                onChange={handleInputChange}
                className="h-12 bg-card border-border focus:border-primary focus:ring-primary/20 pr-10"
                aria-describedby="debtAmount-hint"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                €
              </span>
            </div>
            <p id="debtAmount-hint" className="text-xs text-muted-foreground">
              Eine ungefähre Angabe genügt. Wir klären die Details gemeinsam.
            </p>
          </div>

          {/* Situation Textarea */}
          <div className="space-y-2">
            <Label htmlFor="situation" className="text-sm font-medium text-foreground">
              Ihre Situation beschreiben <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(Pflichtfeld)</span>
            </Label>
            <Textarea
              id="situation"
              name="situation"
              required
              placeholder="Erzählen Sie uns in Ihren eigenen Worten von Ihrer aktuellen finanziellen Situation. Was belastet Sie am meisten? Wie können wir Ihnen helfen?"
              value={formData.situation}
              onChange={handleInputChange}
              className="min-h-[160px] bg-card border-border focus:border-primary focus:ring-primary/20 resize-y leading-relaxed"
              aria-required="true"
              aria-describedby="situation-hint"
            />
            <p id="situation-hint" className="text-xs text-muted-foreground">
              Ihre Angaben helfen uns, Sie besser zu verstehen und individuell zu beraten.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={handleConsentChange}
                className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                aria-required="true"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="consent"
                  className="text-sm font-medium text-foreground cursor-pointer leading-relaxed"
                >
                  Einwilligung zur Datenverarbeitung <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(Pflichtfeld)</span>
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ich stimme zu, dass meine Daten gemäß der{" "}
                  <a
                    href="/datenschutz"
                    className="text-primary underline underline-offset-2 hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                  >
                    Datenschutzerklärung
                  </a>{" "}
                  verarbeitet und zur Zusammenarbeit mit dem Jobcenter und zuständigen 
                  Beratungsstellen weitergegeben werden dürfen.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ihre Daten werden verschlüsselt übertragen und sicher gespeichert.</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full h-14 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby="submit-hint"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" aria-hidden="true" />
                Wird gesendet...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Weiter
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
          </Button>
          <p id="submit-hint" className="text-center text-xs text-muted-foreground">
            Nach dem Absenden erhalten Sie eine Bestätigung per E-Mail.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
