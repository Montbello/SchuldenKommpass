"use client"

import { cn } from "@/lib/utils"
import { FileText, Upload, TrendingUp, FileCheck, Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Step {
  id: number
  label: string
  icon: LucideIcon
}

const STEPS: Step[] = [
  { id: 1, label: "Situation", icon: FileText },
  { id: 2, label: "Nachweise", icon: Upload },
  { id: 3, label: "Fortschritt", icon: TrendingUp },
  { id: 4, label: "Report", icon: FileCheck },
]

interface StepWizardProps {
  currentStep: number
  completedSteps?: number[]
  onStepClick?: (step: number) => void
}

export function StepWizard({ 
  currentStep, 
  completedSteps = [], 
  onStepClick 
}: StepWizardProps) {
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId)
  const isStepClickable = (stepId: number) => isStepCompleted(stepId) || stepId === currentStep

  const handleStepClick = (stepId: number) => {
    if (isStepClickable(stepId) && onStepClick) {
      onStepClick(stepId)
    }
  }

  return (
    <nav 
      className="w-full" 
      role="navigation" 
      aria-label="Fortschrittsanzeige"
    >
      {/* Desktop/Tablet: Horizontal Layout */}
      <div className="hidden sm:block">
        <ol className="flex items-center justify-between" role="list">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon
            const completed = isStepCompleted(step.id)
            const active = currentStep === step.id
            const clickable = isStepClickable(step.id)

            return (
              <li 
                key={step.id} 
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    disabled={!clickable}
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      completed && "border-primary bg-primary text-primary-foreground",
                      active && !completed && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                      !active && !completed && "border-border bg-card text-muted-foreground",
                      clickable && !active && "hover:border-primary/60 hover:bg-primary/5 cursor-pointer",
                      !clickable && "cursor-not-allowed opacity-60"
                    )}
                    aria-current={active ? "step" : undefined}
                    aria-label={`${step.label}${completed ? " - abgeschlossen" : active ? " - aktueller Schritt" : ""}`}
                  >
                    {completed ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <StepIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "mt-2 text-sm font-medium transition-colors",
                      active || completed ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connecting Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className="flex-1 mx-4 h-0.5 mt-[-1.25rem]"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-full rounded-full transition-colors duration-300",
                        isStepCompleted(step.id) ? "bg-primary" : "bg-border"
                      )}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      {/* Mobile: Vertical Compact Layout */}
      <div className="sm:hidden">
        <ol className="flex flex-col gap-3" role="list">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon
            const completed = isStepCompleted(step.id)
            const active = currentStep === step.id
            const clickable = isStepClickable(step.id)

            return (
              <li 
                key={step.id} 
                className="flex items-center gap-3"
              >
                {/* Step Indicator */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    disabled={!clickable}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      completed && "border-primary bg-primary text-primary-foreground",
                      active && !completed && "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25",
                      !active && !completed && "border-border bg-card text-muted-foreground",
                      clickable && !active && "hover:border-primary/60 cursor-pointer",
                      !clickable && "cursor-not-allowed opacity-60"
                    )}
                    aria-current={active ? "step" : undefined}
                    aria-label={`${step.label}${completed ? " - abgeschlossen" : active ? " - aktueller Schritt" : ""}`}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <StepIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                  
                  {/* Vertical Connecting Line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-3 mt-1 rounded-full transition-colors duration-300",
                        isStepCompleted(step.id) ? "bg-primary" : "bg-border"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Step Label */}
                <div className="flex-1 pb-3">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      active || completed ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {active && (
                    <span className="ml-2 text-xs text-primary font-medium">
                      (Aktuell)
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Screen Reader Status */}
      <p className="sr-only" aria-live="polite">
        Schritt {currentStep} von {STEPS.length}: {STEPS[currentStep - 1]?.label}
      </p>
    </nav>
  )
}
