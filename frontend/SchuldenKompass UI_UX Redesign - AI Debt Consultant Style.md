# SchuldenKompass UI/UX Redesign
Inspiriert von AI Debt Consultant - Modernes, app-artiges Design mit KI-Berater-Fokus.
## Aktueller Stand
* React + TypeScript + Vite + react-router-dom
* Basis-Funktionen: Auth, Dashboard, Tasks, Matches, Progress, Profile
* Einfaches CSS-Styling vorhanden in `App.css`
## Geplante Änderungen
### 1. Neue Landing Page (für nicht eingeloggte Benutzer)
**Datei:** `src/pages/LandingPage.tsx` (neu)
* Hero-Sektion mit Wertversprechen
* Feature-Highlights (KI-Beratung, Personalisierung, Datenschutz)
* Call-to-Action Buttons
* Testimonials/Social Proof Bereich
### 2. KI-Berater Auswahl Feature
**Dateien:**
* `src/pages/AdvisorSelectionPage.tsx` (neu)
* `src/components/AdvisorCard.tsx` (neu)
* `src/types/index.ts` (erweitern)
Berater-Persönlichkeiten:
* **Der Strukturierte** - Strenger Budgetplaner
* **Der Empatische** - Freundlicher Berater
* **Der Motivator** - Fokus auf Fortschritt und Erfolge
### 3. Chat-Interface für KI-Berater
**Dateien:**
* `src/pages/ChatPage.tsx` (neu)
* `src/components/ChatMessage.tsx` (neu)
* `src/components/ChatInput.tsx` (neu)
Features:
* Chat-Bubble Design
* Typing-Indikator
* Schnellantwort-Buttons
* Berater-Avatar
### 4. Moderneres Design-System
**Datei:** `src/App.css` (überarbeiten)
Änderungen:
* Gradient-Backgrounds für Header/Hero
* Abgerundete Karten mit Schatten
* Modernes Farbschema (Blau/Grün-Gradient)
* Animationen und Übergänge
* Mobile-First Responsive Design
* Bottom-Navigation für Mobile
### 5. Verbessertes Dashboard
**Datei:** `src/pages/Dashboard.tsx` (überarbeiten)
* Begrüßungs-Nachricht vom Berater
* Fortschritts-Ring/Chart
* Tages-Tipps vom KI-Berater
* Schnellzugriff auf Chat
### 6. Gamification-Elemente
**Dateien:**
* `src/components/ProgressRing.tsx` (neu)
* `src/components/AchievementBadge.tsx` (neu)
* `src/components/StreakCounter.tsx` (neu)
Features:
* Punkte-System Visualisierung
* Achievements/Badges
* Tägliche Streaks
### 7. Verbesserte Auth-Seiten
**Dateien:** `src/pages/Login.tsx`, `src/pages/Register.tsx` (überarbeiten)
* Modernes Card-Layout
* Illustrationen/Icons
* Social Login Buttons (UI-Vorbereitung)
* Passwort-Stärke-Indikator
### 8. Mobile Bottom Navigation
**Datei:** `src/components/BottomNav.tsx` (neu)
Für Mobile-Geräte:
* Home, Chat, Aufgaben, Fortschritt, Profil
* Aktiver Zustand mit Animation
## Implementierungsreihenfolge
1. Design-System Updates (CSS)
2. Landing Page
3. Auth-Seiten Redesign
4. KI-Berater Auswahl
5. Chat-Interface
6. Dashboard Verbesserungen
7. Gamification-Elemente
8. Mobile Navigation
