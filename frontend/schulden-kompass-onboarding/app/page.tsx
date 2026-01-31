import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Compass, ShieldCheck, Users, Phone } from "lucide-react"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Compass className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <span className="text-lg font-semibold text-foreground">SchuldenKompass</span>
                <span className="sr-only">- Schuldnerberatung</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>Kostenlose Beratung: 0800 123 4567</span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Vertraulich & kostenlos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-4 text-balance">
              Der erste Schritt in eine schuldenfreie Zukunft
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Wir begleiten Sie auf dem Weg zur finanziellen Stabilität – 
              professionell, vertraulich und ohne Vorurteile.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">DSGVO-konform</p>
                <p className="text-xs text-muted-foreground">Datenschutz garantiert</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Jobcenter Partner</p>
                <p className="text-xs text-muted-foreground">Offizielle Kooperation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Über 10.000</p>
                <p className="text-xs text-muted-foreground">Beratene Personen</p>
              </div>
            </div>
          </div>

          {/* Wizard */}
          <OnboardingWizard />

          {/* Footer Note */}
          <div className="mt-10 sm:mt-12 text-center">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              SchuldenKompass ist ein Angebot in Zusammenarbeit mit den deutschen 
              Jobcentern. Alle Beratungen sind kostenlos und unverbindlich.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>© 2026 SchuldenKompass</span>
            </div>
            <nav aria-label="Footer-Navigation">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <a
                    href="/impressum"
                    className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1"
                  >
                    Impressum
                  </a>
                </li>
                <li>
                  <a
                    href="/datenschutz"
                    className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1"
                  >
                    Datenschutz
                  </a>
                </li>
                <li>
                  <a
                    href="/barrierefreiheit"
                    className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1"
                  >
                    Barrierefreiheit
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
