import prisma from '../../prismaClient';
import { OnboardingStatus } from '@prisma/client';

export interface StabilityCheckResult {
  status: OnboardingStatus;
  score: number;
  reasons: string[];
  requiresManualReview: boolean;
  missingRequirements: string[];
}

export interface StabilityRules {
  minDocuments: number;
  requiredConsents: string[];
  autoApproveThreshold: number;
  autoRejectThreshold: number;
}

const DEFAULT_RULES: StabilityRules = {
  minDocuments: 1, // Mindestens ein Nachweis (PROOF_FINANCIAL)
  requiredConsents: ['consent_data_processing', 'consent_data_sharing'],
  autoApproveThreshold: 80, // Score >= 80 → Auto-Approve
  autoRejectThreshold: 30,  // Score < 30 → Auto-Reject
};

export const stabilityService = {
  /**
   * Automatische Stabilitätsprüfung eines Users
   * Wird nach dem letzten Onboarding-Schritt aufgerufen
   */
  async checkStability(userId: string, rules: StabilityRules = DEFAULT_RULES): Promise<StabilityCheckResult> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        skills: true,
        documents: {
          where: {
            document_category: {
              in: ['PROOF_MEDICAL', 'PROOF_FINANCIAL', 'PROOF_IDENTITY'],
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let score = 0;
    const reasons: string[] = [];
    const missingRequirements: string[] = [];

    // 1. Consent-Prüfung (Pflicht)
    const consentsValid = this.checkConsents(user, rules, reasons, missingRequirements);
    if (consentsValid) {
      score += 20;
      reasons.push('Alle erforderlichen Einwilligungen erteilt');
    }

    // 2. Dokumenten-Prüfung
    const documentsValid = this.checkDocuments(user, rules, reasons, missingRequirements);
    if (documentsValid) {
      score += 30;
      reasons.push(`${user.documents.length} Nachweis(e) hochgeladen`);
    }

    // 3. Profil-Vollständigkeit
    const profileComplete = this.checkProfileCompleteness(user, reasons, missingRequirements);
    if (profileComplete) {
      score += 20;
      reasons.push('Profil vollständig ausgefüllt');
    }

    // 4. Skills vorhanden
    if (user.skills.length > 0) {
      score += 15;
      reasons.push(`${user.skills.length} Fähigkeit(en) angegeben`);
    } else {
      missingRequirements.push('Keine Fähigkeiten angegeben');
    }

    // 5. User Story vorhanden
    if (user.user_story && user.user_story.length > 10) {
      score += 15;
      reasons.push('Persönliche Geschichte erfasst');
    } else {
      missingRequirements.push('User Story fehlt oder zu kurz');
    }

    // 6. High-Risk-Checks (würde Score reduzieren)
    const hasHighRiskFlags = this.checkHighRiskFlags(user);
    if (hasHighRiskFlags) {
      score -= 30;
      reasons.push('⚠️ Hochrisiko-Indikatoren erkannt - manuelle Prüfung erforderlich');
    }

    // Entscheidung basierend auf Score
    let status: OnboardingStatus;
    let requiresManualReview = false;

    if (score >= rules.autoApproveThreshold && !hasHighRiskFlags) {
      status = OnboardingStatus.APPROVED;
      reasons.push(`✅ Automatisch genehmigt (Score: ${score})`);
    } else if (score < rules.autoRejectThreshold) {
      status = OnboardingStatus.REJECTED;
      reasons.push(`❌ Automatisch abgelehnt (Score zu niedrig: ${score})`);
    } else {
      status = OnboardingStatus.PENDING_REVIEW;
      requiresManualReview = true;
      reasons.push(`🔍 Manuelle Prüfung erforderlich (Score: ${score})`);
    }

    return {
      status,
      score,
      reasons,
      requiresManualReview,
      missingRequirements,
    };
  },

  /**
   * Prüfung der erforderlichen Consents
   */
  checkConsents(user: any, rules: StabilityRules, reasons: string[], missing: string[]): boolean {
    let allValid = true;

    for (const consent of rules.requiredConsents) {
      if (!user[consent]) {
        missing.push(`Einwilligung fehlt: ${consent}`);
        allValid = false;
      }
    }

    return allValid;
  },

  /**
   * Prüfung der hochgeladenen Dokumente
   */
  checkDocuments(user: any, rules: StabilityRules, reasons: string[], missing: string[]): boolean {
    const documents = user.documents || [];

    if (documents.length < rules.minDocuments) {
      missing.push(`Mindestens ${rules.minDocuments} Nachweis(e) erforderlich`);
      return false;
    }

    // Prüfe, ob PROOF_FINANCIAL vorhanden ist (Pflicht)
    const hasFinancialProof = documents.some((doc: any) => doc.document_category === 'PROOF_FINANCIAL');
    if (!hasFinancialProof) {
      missing.push('Finanzieller Nachweis (PROOF_FINANCIAL) fehlt');
      return false;
    }

    // Wenn Disabilities angegeben, muss PROOF_MEDICAL vorhanden sein
    if (user.disabilities) {
      const hasMedicalProof = documents.some((doc: any) => doc.document_category === 'PROOF_MEDICAL');
      if (!hasMedicalProof) {
        missing.push('Ärztlicher Nachweis (PROOF_MEDICAL) erforderlich bei Einschränkungen');
        return false;
      }
    }

    return true;
  },

  /**
   * Prüfung der Profil-Vollständigkeit
   */
  checkProfileCompleteness(user: any, reasons: string[], missing: string[]): boolean {
    let complete = true;

    if (!user.name || user.name.trim().length === 0) {
      missing.push('Name fehlt');
      complete = false;
    }

    if (!user.date_of_birth) {
      missing.push('Geburtsdatum fehlt');
      complete = false;
    }

    // Alter-Check: User muss zwischen 18 und 67 Jahre alt sein
    if (user.date_of_birth) {
      const age = this.calculateAge(new Date(user.date_of_birth));
      if (age < 18) {
        missing.push('Nutzer ist unter 18 Jahren');
        complete = false;
      }
      if (age > 67) {
        reasons.push('⚠️ Nutzer über 67 Jahre - spezielle Beratung erforderlich');
      }
    }

    return complete;
  },

  /**
   * High-Risk-Flags Check
   * (z.B. für spätere Erweiterung: Suchterkennung, Betrugshinweise)
   */
  checkHighRiskFlags(user: any): boolean {
    // Placeholder für zukünftige High-Risk-Checks
    // Beispiel: Wenn user_story bestimmte Keywords enthält
    
    if (user.user_story) {
      const story = user.user_story.toLowerCase();
      const riskKeywords = ['sucht', 'alkohol', 'drogen', 'glücksspiel', 'spielsucht', 'betrug'];
      
      for (const keyword of riskKeywords) {
        if (story.includes(keyword)) {
          return true; // High-Risk erkannt
        }
      }
    }

    return false;
  },

  /**
   * Hilfsfunktion: Alter berechnen
   */
  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Stability-Check ausführen und User-Status aktualisieren
   */
  async runAndUpdateStatus(userId: string): Promise<StabilityCheckResult> {
    const result = await this.checkStability(userId);

    // Update User mit Stability-Score und Status
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        stability_score: result.score,
        onboarding_status: result.status,
      },
    });

    // Audit-Log erstellen
    await prisma.auditEvent.create({
      data: {
        entity: 'User',
        entity_id: userId,
        action: 'stability_check',
        payload: {
          score: result.score,
          status: result.status,
          reasons: result.reasons,
          missingRequirements: result.missingRequirements,
          requiresManualReview: result.requiresManualReview,
        },
      },
    });

    return result;
  },
};
