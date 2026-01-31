# SchuldenKompass

**Digitale Brücke zwischen verschuldeten Menschen und Behörden** – Ein KI-gestütztes System, das den Fortschritt von Menschen in Schuldensituationen dokumentiert und professionelle Statusberichte für Jobcenter und Schuldnerberatungen generiert.

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, React Router 7 |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **AI/ML** | Google Gemini 1.5 Flash (Behörden-Report-Generierung) |
| **Auth** | JWT (httpOnly Cookies), CSRF Protection, Argon2 |

## How to Run

### Prerequisites
- Node.js 18+
- PostgreSQL (oder Docker)
- Google Gemini API Key

### 1. Clone & Install

```bash
git clone https://github.com/your-team/schuldenkompass.git
cd schuldenkompass
npm install
```

### 2. Database Setup

```bash
# Mit Docker:
cd backend
npm run db:up

# Oder manuell PostgreSQL starten und DATABASE_URL setzen
```

### 3. Environment Variables

```bash
# Backend: backend/.env
cp backend/.env.example backend/.env
```

Fülle die `.env` aus:
```
JWT_SECRET=your-secure-random-secret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/schuldenkompass
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
```

### 4. Database Migration

```bash
cd backend
npm run prisma:migrate:dev
npm run prisma:generate
```

### 5. Run Development Servers

```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

## Demo Flow

1. **Registrieren** → Neuen Account erstellen
2. **Story eingeben** → Persönliche Situation beschreiben
3. **Dokumente hochladen** → Nachweise hinzufügen
4. **Report generieren** → Gemini erstellt Behörden-Statusbericht
5. **Report nutzen** → Drucken oder an Jobcenter senden

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registrieren |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Aktueller User |
| POST | `/api/reports/generate` | **Gemini Report generieren** |
| GET | `/api/progress` | User Progress |
| POST | `/api/documents/upload` | Dokument hochladen |

## Gemini Integration

SchuldenKompass nutzt Gemini minimal und gezielt:

> "Gemini is used to translate complex human situations into institution-ready language."

**Input:** User Story + Progress + Dokumente  
**Output:** Professioneller, sachlicher Behörden-Report

## Team

- [Team Member 1]
- [Team Member 2]

---

*Built at the Cursor 2-Day AI Hackathon Hamburg 2026*
