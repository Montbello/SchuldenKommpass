"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressRing } from "@/components/progress-ring"
import { Star, CheckCircle2, TrendingUp, Calendar, FileText, Clock, Upload, Phone, ClipboardList, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardProps {
  userName?: string
  completionPercentage?: number
  pointsCollected?: number
  tasksCompleted?: number
  totalTasks?: number
  documentsCount?: number
}

export function Dashboard({
  userName = "Max",
  completionPercentage = 65,
  pointsCollected = 120,
  tasksCompleted = 8,
  totalTasks = 12,
  documentsCount = 3,
}: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="font-semibold text-foreground">SchuldenKompass</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>{new Date().toLocaleDateString("de-DE", { 
              weekday: "long", 
              day: "numeric", 
              month: "long" 
            })}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
            Willkommen zurück, {userName}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Sie machen gute Fortschritte auf Ihrem Weg zur Schuldenfreiheit.
          </p>
        </section>

        {/* Prominent CTA Section */}
        <section className="mb-8">
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <FileText className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                      Behörden-Report erstellen
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Erstellen Sie einen vollständigen Bericht für das Jobcenter mit allen relevanten Unterlagen.
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full md:w-auto text-base font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <FileText className="mr-2 h-5 w-5" aria-hidden="true" />
                  Behörden-Report erstellen
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Progress Card - Large */}
          <Card className="border-border/60 shadow-sm md:col-span-2 lg:col-span-1 lg:row-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-foreground">
                Ihr Fortschritt
              </CardTitle>
              <CardDescription>
                Gesamtfortschritt im Programm
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <ProgressRing percentage={completionPercentage} />
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Weiter so! Sie sind auf einem guten Weg.
              </p>
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Star className="h-6 w-6 text-amber-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Punkte</p>
              <p className="text-3xl font-bold text-foreground">{pointsCollected}</p>
              <p className="text-xs text-emerald-600 mt-2">+15 diese Woche</p>
            </CardContent>
          </Card>

          {/* Tasks Card */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Aufgaben</p>
              <p className="text-3xl font-bold text-foreground">
                {tasksCompleted}<span className="text-lg text-muted-foreground font-normal">/{totalTasks}</span>
              </p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(tasksCompleted / totalTasks) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={tasksCompleted}
                  aria-valuemin={0}
                  aria-valuemax={totalTasks}
                  aria-label={`${tasksCompleted} von ${totalTasks} Aufgaben erledigt`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Dokumente</p>
              <p className="text-3xl font-bold text-foreground">{documentsCount}</p>
              <p className="text-xs text-muted-foreground mt-2">hochgeladen</p>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="border-border/60 shadow-sm lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Letzte Aktivitäten
              </CardTitle>
              <CardDescription>
                Ihre kürzlich erledigten Aufgaben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3" role="list" aria-label="Erledigte Aufgaben">
                {[
                  { 
                    title: "Kontoauszüge hochgeladen", 
                    time: "Vor 2 Stunden",
                    icon: Upload,
                    points: "+10"
                  },
                  { 
                    title: "Telefontermin wahrgenommen", 
                    time: "Gestern",
                    icon: Phone,
                    points: "+25"
                  },
                  { 
                    title: "Haushaltsplan erstellt", 
                    time: "Vor 3 Tagen",
                    icon: ClipboardList,
                    points: "+20"
                  },
                  { 
                    title: "Profil vervollständigt", 
                    time: "Vor 5 Tagen",
                    icon: CheckCircle2,
                    points: "+15"
                  },
                ].map((activity, index) => (
                  <li 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                        <activity.icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">{activity.points} Punkte</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
