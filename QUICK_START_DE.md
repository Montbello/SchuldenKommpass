# 🚀 Quick Start: GitHub Pages Deployment

## 📍 Wichtige Links

| Was | URL |
|-----|-----|
| **Repository Settings (Pages aktivieren)** | https://github.com/Montbello/SchuldenKommpass/settings/pages |
| **Actions / Workflow Status** | https://github.com/Montbello/SchuldenKommpass/actions |
| **Deployed App (nach Aktivierung)** | https://montbello.github.io/SchuldenKommpass/ |

---

## ⚡ 3 Schritte zum Deployment

### 1️⃣ GitHub Pages aktivieren
```
1. Klicke: https://github.com/Montbello/SchuldenKommpass/settings/pages
2. Wähle unter "Source": GitHub Actions
3. Klicke "Save"
```

### 2️⃣ Workflow startet automatisch
```
- Nach dem Speichern startet das Deployment automatisch
- Status sehen unter: Actions Tab
- Dauer: ca. 1-2 Minuten
```

### 3️⃣ App öffnen und testen
```
URL: https://montbello.github.io/SchuldenKommpass/
- Landing Page testen
- Durch UI navigieren
- Login/Register Seiten ansehen
```

---

## 🎯 Was wurde gemacht?

✅ **Frontend für GitHub Pages konfiguriert**
- Vite Build mit korrektem Base-Path
- React Router mit basename
- GitHub Actions Workflow erstellt

✅ **TypeScript Fehler behoben**
- INSTITUTION Role hinzugefügt
- Build erfolgreich getestet

✅ **Dokumentation erstellt**
- GITHUB_PAGES.md (Englisch, technisch)
- DEPLOYMENT_STEPS_DE.md (Deutsch, detailliert)
- Dieser Quick Start Guide

---

## ⚠️ Einschränkungen

### GitHub Pages deployed NUR das Frontend (statische Dateien):

**Funktioniert:**
- ✅ UI/Design ansehen
- ✅ Seiten navigieren
- ✅ Responsive Design testen
- ✅ Layout und Styling prüfen

**Funktioniert NICHT:**
- ❌ Login/Registrierung (braucht Backend)
- ❌ Daten speichern/laden (braucht Datenbank)
- ❌ API Aufrufe

### Für vollständige Funktionalität:

**Option A: Backend separat deployen**
```
Backend → Railway (bereits konfiguriert)
Frontend → GitHub Pages
```

**Option B: Alles zusammen deployen**
```
Frontend + Backend → Vercel oder Netlify
(mit Backend Proxy)
```

Siehe `README.md` für Details zu Railway/Vercel Deployment.

---

## 🐛 Troubleshooting

### "404 - Page not found"
→ GitHub Pages noch nicht aktiviert (siehe Schritt 1)

### "Workflow failed"
→ Actions Tab checken für Fehlerdetails

### "App lädt nicht"
→ Cache leeren, Incognito-Fenster probieren

### "API Fehler"
→ Normal! Backend nicht deployed (siehe Einschränkungen)

---

## 📞 Weitere Hilfe

1. **DEPLOYMENT_STEPS_DE.md** - Ausführliche deutsche Anleitung
2. **GITHUB_PAGES.md** - Technische Dokumentation
3. **GitHub Actions Tab** - Deployment Logs ansehen
4. **README.md** - Allgemeine Projekt-Dokumentation

---

## ✨ Nächste Schritte nach GitHub Pages

Sobald die UI auf GitHub Pages läuft:

1. **Backend auf Railway deployen** (siehe `railway.toml`)
2. **Frontend API URL konfigurieren** (auf Railway Backend zeigen)
3. **Vollständige Funktionalität testen**

Viel Erfolg! 🚀
