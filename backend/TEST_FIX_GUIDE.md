# Test Mock Korrektur - Anleitung

## Status

✅ **users.service.spec.ts** - Vollständig korrigiert und funktioniert
✅ **13 Tests bestanden**
⚠️ **9 Test-Dateien** benötigen noch Mock-Anpassungen

## Das Problem

Vitest "hoistet" `vi.mock()` Aufrufe an den Anfang der Datei. Daher funktionieren externe Mock-Variablen nicht:

```typescript
// ❌ FALSCH - verursacht ReferenceError
const mockUserFindUnique = vi.fn();

vi.mock('../../prismaClient', () => ({
  default: {
    user: {
      findUnique: mockUserFindUnique, // Fehler: nicht definiert!
    }
  }
}));
```

## Die Lösung

### Schritt 1: Mocks inline in vi.mock() definieren

```typescript
// ✅ RICHTIG
vi.mock('../../prismaClient', () => ({
  default: {
    user: {
      findUnique: vi.fn(),  // Direkt inline
      update: vi.fn(),
    }
  }
}));
```

### Schritt 2: Import hinzufügen

```typescript
import { usersService } from './users.service';
import prisma from '../../prismaClient';  // ← Wichtig!
```

### Schritt 3: beforeEach anpassen

```typescript
describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();  // Einfach alle Mocks zurücksetzen
  });
```

### Schritt 4: Mock-Aufrufe anpassen

```typescript
// ❌ ALT
mockUserFindUnique.mockResolvedValue(mockData);

// ✅ NEU
vi.mocked(prisma.user.findUnique).mockResolvedValue(mockData as any);
```

### Schritt 5: Expectations anpassen

```typescript
// ❌ ALT
expect(mockUserFindUnique).toHaveBeenCalledWith({...});

// ✅ NEU
expect(prisma.user.findUnique).toHaveBeenCalledWith({...});
```

## Verbleibende Test-Dateien

Diese Dateien benötigen noch Anpassungen:

1. ✅ auth.service.spec.ts
2. ⚠️ appointments.service.spec.ts
3. ⚠️ certificates.service.spec.ts
4. ⚠️ institutions.service.spec.ts
5. ⚠️ matches.service.spec.ts
6. ⚠️ onboarding.service.spec.ts
7. ⚠️ stability.service.spec.ts
8. ⚠️ progress.service.spec.ts
9. ⚠️ tasks.service.spec.ts
10. ⚠️ users.controller.spec.ts

## Schnelle Referenz

Verwende **users.service.spec.ts** als Vorlage für die korrekte Struktur!

### Typische Ersetzungen:

| Alt | Neu |
|-----|-----|
| `const mockFindMany = vi.fn();` | Entfernen |
| `mockFindMany.mockResolvedValue(data)` | `vi.mocked(prisma.xxx.findMany).mockResolvedValue(data)` |
| `expect(mockFindMany)` | `expect(prisma.xxx.findMany)` |
| `mockXxx.mockReset()` | `vi.clearAllMocks()` in beforeEach |

## Test ausführen

```bash
npm test
```

Oder nur einen spezifischen Test:

```bash
npm test -- src/modules/users/users.service.spec.ts
```

## Ziel

Nach Korrektur aller Tests sollte die Coverage **>80%** erreichen.
