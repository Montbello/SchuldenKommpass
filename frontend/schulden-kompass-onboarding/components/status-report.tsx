"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Compass, Printer, Download, Calendar, User, FileText, CheckCircle2, AlertCircle } from "lucide-react"

interface StatusReportProps {
  userName?: string
  caseNumber?: string
  generationDate?: string
  completionPercentage?: number
}

export function StatusReport({
  userName = "Max Mustermann",
  caseNumber = "SK-2026-001234",
  generationDate = "31. Januar 2026",
  completionPercentage = 65,
}: StatusReportProps) {

  const handlePrint = () => {
    window.print()
  }

  const handleSavePDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Print-only header spacing */}
      <div className="hidden print:block print:h-0" />
      
      {/* Action Bar - Hidden on Print */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="font-semibold text-foreground">SchuldenKompass</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 bg-transparent"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Drucken</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSavePDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Als PDF speichern</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 print:py-0 print:px-0 print:max-w-none">
        <Card className="border-border shadow-sm print:shadow-none print:border-0">
          {/* Document Header */}
          <CardHeader className="border-b border-border pb-6 print:pb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Logo and Title */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground print:bg-foreground print:text-background shrink-0">
                  <Compass className="h-8 w-8" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
                    SchuldenKompass
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    STATUSBERICHT
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatisch generierter Bericht zur Vorlage bei Behörden
                  </p>
                </div>
              </div>
              
              {/* Document Meta */}
              <div className="text-sm text-muted-foreground space-y-1.5 sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end">
                  <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Erstellt am: <span className="text-foreground font-medium">{generationDate}</span></span>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Aktenzeichen: <span className="text-foreground font-medium">{caseNumber}</span></span>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Klient: <span className="text-foreground font-medium">{userName}</span></span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 space-y-8 print:space-y-10">
            {/* Status Badge */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Programmfortschritt: {completionPercentage}%</p>
                <p className="text-sm text-muted-foreground">Aktive Teilnahme am Schuldnerberatungsprogramm</p>
              </div>
            </div>

            {/* Zusammenfassung */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary text-sm font-bold">1</span>
                Zusammenfassung
              </h2>
              <Separator className="mb-4" />
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                <p>
                  {userName} nimmt seit dem 15. November 2025 aktiv am Schuldnerberatungsprogramm 
                  SchuldenKompass teil. Der Klient zeigt eine konstante und engagierte Mitwirkung 
                  bei allen erforderlichen Maßnahmen zur Schuldenregulierung.
                </p>
                <p className="mt-3">
                  Die bisherige Zusammenarbeit verlief konstruktiv. Alle vereinbarten Termine wurden 
                  wahrgenommen, erforderliche Unterlagen wurden fristgerecht eingereicht, und der 
                  Klient zeigt eine hohe Motivation zur Lösung seiner finanziellen Situation.
                </p>
              </div>
            </section>

            {/* Statusbewertung */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary text-sm font-bold">2</span>
                Statusbewertung
              </h2>
              <Separator className="mb-4" />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Dokumenteneinreichung</p>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      Vollständig
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Terminwahrnehmung</p>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      100% (8/8)
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Haushaltsplan</p>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      Erstellt und aktuell
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Gläubigerverhandlungen</p>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                      In Bearbeitung
                    </p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                  <p>
                    Die Gesamtbewertung des Beratungsverlaufs ist positiv. Der Klient erfüllt alle 
                    Mitwirkungspflichten und zeigt aktives Engagement bei der Umsetzung der 
                    vereinbarten Maßnahmen. Die Gläubigerverhandlungen befinden sich in einem 
                    fortgeschrittenen Stadium.
                  </p>
                </div>
              </div>
            </section>

            {/* Empfehlungen */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary text-sm font-bold">3</span>
                Empfehlungen
              </h2>
              <Separator className="mb-4" />
              <ul className="space-y-3" role="list">
                {[
                  "Fortsetzung der Beratungsmaßnahmen wird empfohlen",
                  "Regelmäßige Überprüfung des Haushaltsplans alle 4 Wochen",
                  "Weiterführung der Gläubigerkorrespondenz durch die Beratungsstelle",
                  "Aufrechterhaltung der Mitwirkungsbereitschaft seitens des Klienten",
                  "Prüfung möglicher Ratenzahlungsvereinbarungen mit Hauptgläubigern",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Nächste Schritte */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary text-sm font-bold">4</span>
                Nächste Schritte
              </h2>
              <Separator className="mb-4" />
              <ol className="space-y-3" role="list">
                {[
                  { step: "Abschluss der ausstehenden Gläubigerverhandlungen", deadline: "bis 15.02.2026" },
                  { step: "Aktualisierung des Schuldenbereinigungsplans", deadline: "bis 28.02.2026" },
                  { step: "Einreichung des aktualisierten Haushaltsplans", deadline: "bis 01.03.2026" },
                  { step: "Nächster Beratungstermin", deadline: "12.02.2026, 10:00 Uhr" },
                  { step: "Vorlage der Einkommensnachweise für Februar", deadline: "bis 05.03.2026" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-foreground">{item.step}</span>
                      <span className="text-muted-foreground text-sm ml-2">({item.deadline})</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Document Footer */}
            <Separator className="mt-8" />
            <footer className="pt-6 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Dieser Bericht wurde automatisch durch das SchuldenKompass-System generiert.</p>
                  <p>Bei Rückfragen wenden Sie sich bitte an Ihre zuständige Beratungsstelle.</p>
                  <p className="font-medium text-foreground mt-2">
                    Dokumenten-ID: {caseNumber}-RPT-{Date.now().toString().slice(-6)}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground shrink-0">
                  <p>SchuldenKompass</p>
                  <p>Schuldnerberatung</p>
                  <p className="mt-2 font-medium text-foreground">{generationDate}</p>
                </div>
              </div>
            </footer>
          </CardContent>
        </Card>

        {/* Bottom Action Bar - Hidden on Print */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 print:hidden">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrint}
            className="gap-2 bg-transparent"
          >
            <Printer className="h-5 w-5" aria-hidden="true" />
            Drucken
          </Button>
          <Button
            size="lg"
            onClick={handleSavePDF}
            className="gap-2"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
            Als PDF speichern
          </Button>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
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
