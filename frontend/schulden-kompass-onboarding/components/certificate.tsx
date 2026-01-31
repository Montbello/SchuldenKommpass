"use client"

import { Button } from "@/components/ui/button"
import { Compass, Printer, Award } from "lucide-react"

interface CertificateProps {
  userName?: string
  tasksCompleted?: number
  pointsEarned?: number
  issueDate?: string
  certificateId?: string
}

export function Certificate({
  userName = "Max Mustermann",
  tasksCompleted = 12,
  pointsEarned = 185,
  issueDate = "31. Januar 2026",
  certificateId = "SK-CERT-2026-001234",
}: CertificateProps) {

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4 print:bg-white print:py-0 print:px-0">
      {/* Action Bar - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-semibold text-foreground">SchuldenKompass</span>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Drucken
        </Button>
      </div>

      {/* Certificate Container */}
      <div className="max-w-4xl mx-auto print:max-w-none">
        <div 
          className="relative bg-card aspect-[1/1.414] w-full max-w-[210mm] mx-auto shadow-xl print:shadow-none"
          role="img"
          aria-label={`Teilnahme-Zertifikat für ${userName}`}
        >
          {/* Outer Border Frame */}
          <div className="absolute inset-4 sm:inset-6 md:inset-8 border-2 border-primary/30 rounded-sm" />
          
          {/* Inner Border Frame */}
          <div className="absolute inset-6 sm:inset-8 md:inset-10 border border-border rounded-sm" />
          
          {/* Corner Ornaments */}
          <div className="absolute top-8 sm:top-10 md:top-12 left-8 sm:left-10 md:left-12 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-l-2 border-t-2 border-primary/40 rounded-tl-sm" />
          <div className="absolute top-8 sm:top-10 md:top-12 right-8 sm:right-10 md:right-12 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-r-2 border-t-2 border-primary/40 rounded-tr-sm" />
          <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-8 sm:left-10 md:left-12 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-l-2 border-b-2 border-primary/40 rounded-bl-sm" />
          <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 right-8 sm:right-10 md:right-12 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-r-2 border-b-2 border-primary/40 rounded-br-sm" />

          {/* Content */}
          <div className="absolute inset-10 sm:inset-14 md:inset-16 flex flex-col items-center justify-between py-4 sm:py-6 md:py-8">
            
            {/* Header Section */}
            <div className="text-center w-full">
              {/* Logo */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30">
                  <Compass className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" aria-hidden="true" />
                </div>
              </div>
              
              {/* Title */}
              <p className="text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground uppercase mb-2 sm:mb-3">
                SchuldenKompass
              </p>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide text-foreground mb-1 sm:mb-2">
                TEILNAHME-ZERTIFIKAT
              </h1>
              <div className="w-16 sm:w-20 md:w-24 h-0.5 bg-primary/40 mx-auto" />
            </div>

            {/* Main Content Section */}
            <div className="text-center w-full flex-1 flex flex-col justify-center py-4 sm:py-6 md:py-8">
              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-8 sm:w-12 md:w-16 h-px bg-border" />
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60" aria-hidden="true" />
                <div className="w-8 sm:w-12 md:w-16 h-px bg-border" />
              </div>

              {/* Name */}
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4 sm:mb-6 tracking-wide text-balance">
                {userName}
              </p>

              {/* Completion Text */}
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed max-w-md mx-auto px-4">
                hat erfolgreich am SchuldenKompass-Programm teilgenommen und alle erforderlichen Maßnahmen zur Schuldenregulierung abgeschlossen.
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-6 sm:gap-8 md:gap-12 mb-4 sm:mb-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{tasksCompleted}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Aufgaben abgeschlossen</p>
                </div>
                <div className="w-px h-12 sm:h-14 md:h-16 bg-border" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{pointsEarned}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Punkte erreicht</p>
                </div>
              </div>

              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="w-8 sm:w-12 md:w-16 h-px bg-border" />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/40" />
                <div className="w-8 sm:w-12 md:w-16 h-px bg-border" />
              </div>
            </div>

            {/* Footer Section */}
            <div className="w-full">
              {/* Issue Date */}
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Ausgestellt am</p>
                <p className="text-sm sm:text-base md:text-lg font-medium text-foreground">{issueDate}</p>
              </div>

              {/* Bottom Row */}
              <div className="flex items-end justify-between px-2 sm:px-4">
                {/* QR Code Placeholder */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 border border-border rounded bg-muted/30 flex items-center justify-center mb-1 sm:mb-2">
                    <div className="grid grid-cols-4 gap-0.5 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 p-1">
                      {/* QR Code Pattern */}
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-xs ${[0,1,2,4,7,8,11,12,13,14,15].includes(i) ? 'bg-foreground/70' : 'bg-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground text-center">Verifizierung</p>
                </div>

                {/* Signature Area */}
                <div className="text-center flex-1 mx-4 sm:mx-6 md:mx-8">
                  <div className="border-b border-foreground/30 w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] mx-auto mb-1 sm:mb-2 h-6 sm:h-8 flex items-end justify-center">
                    <span className="font-serif italic text-foreground/60 text-sm sm:text-base md:text-lg pb-0.5">SchuldenKompass</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Programmleitung</p>
                </div>

                {/* Certificate ID */}
                <div className="text-right">
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-0.5">Zertifikat-Nr.</p>
                  <p className="text-[9px] sm:text-xs font-mono text-muted-foreground">{certificateId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
