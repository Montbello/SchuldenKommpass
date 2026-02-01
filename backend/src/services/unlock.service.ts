import { prisma } from '../prismaClient';
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Unlock/Level System
 * Manages user levels, points, and feature unlocks
 */

export interface UnlockConfig {
  level: number;
  requiredPoints: number;
  title: string;
  features: string[];
  certificateTitle?: string;
}

// Level progression: Each level requires more points
export const LEVEL_SYSTEM: UnlockConfig[] = [
  {
    level: 1,
    requiredPoints: 0,
    title: 'Newcomer',
    features: ['basic_dashboard', 'profile_view', 'task_view'],
  },
  {
    level: 2,
    requiredPoints: 50,
    title: 'Starter',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload'],
    certificateTitle: 'Erste Schritte absolviert',
  },
  {
    level: 3,
    requiredPoints: 150,
    title: 'Aktiv',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload', 'community_access', 'advisor_booking'],
    certificateTitle: 'Aktiver Teilnehmer',
  },
  {
    level: 4,
    requiredPoints: 300,
    title: 'Engagiert',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload', 'community_access', 'advisor_booking', 'premium_support'],
    certificateTitle: 'Engagierter Fortschritt',
  },
  {
    level: 5,
    requiredPoints: 500,
    title: 'Fortgeschritten',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload', 'community_access', 'advisor_booking', 'premium_support', 'job_board_access'],
    certificateTitle: 'Fortgeschrittener Status',
  },
  {
    level: 6,
    requiredPoints: 750,
    title: 'Erfahren',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload', 'community_access', 'advisor_booking', 'premium_support', 'job_board_access', 'partner_offers'],
    certificateTitle: 'Erfahrener Nutzer',
  },
  {
    level: 7,
    requiredPoints: 1000,
    title: 'Expert',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload', 'community_access', 'advisor_booking', 'premium_support', 'job_board_access', 'partner_offers', 'mentoring_access'],
    certificateTitle: 'Experten-Status erreicht',
  },
  {
    level: 8,
    requiredPoints: 1500,
    title: 'Champion',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload', 'community_access', 'advisor_booking', 'premium_support', 'job_board_access', 'partner_offers', 'mentoring_access', 'priority_support'],
    certificateTitle: 'Champion-Status',
  },
  {
    level: 9,
    requiredPoints: 2000,
    title: 'Master',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload', 'community_access', 'advisor_booking', 'premium_support', 'job_board_access', 'partner_offers', 'mentoring_access', 'priority_support', 'exclusive_events'],
    certificateTitle: 'Master-Status',
  },
  {
    level: 10,
    requiredPoints: 3000,
    title: 'Legend',
    features: ['basic_dashboard', 'profile_view', 'task_view', 'task_accept', 'document_upload', 'community_access', 'advisor_booking', 'premium_support', 'job_board_access', 'partner_offers', 'mentoring_access', 'priority_support', 'exclusive_events', 'all_access'],
    certificateTitle: 'Legend - Höchster Status',
  },
];

export const unlockService = {
  /**
   * Calculate user level based on total points
   */
  calculateLevel(totalPoints: number): UnlockConfig {
    // Find the highest level the user qualifies for
    let currentLevel = LEVEL_SYSTEM[0];
    
    for (const level of LEVEL_SYSTEM) {
      if (totalPoints >= level.requiredPoints) {
        currentLevel = level;
      } else {
        break;
      }
    }
    
    return currentLevel;
  },

  /**
   * Get next level info
   */
  getNextLevel(currentLevel: number): UnlockConfig | null {
    if (currentLevel >= LEVEL_SYSTEM.length) {
      return null; // Max level reached
    }
    
    return LEVEL_SYSTEM[currentLevel]; // Next level (0-indexed)
  },

  /**
   * Award points to a user and check for level-up
   */
  async awardPoints(
    userId: string,
    points: number,
    reason: string,
    awardedBy?: string
  ): Promise<{
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    newTotalPoints: number;
    certificateIssued?: any;
  }> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        total_points: true,
        level: true,
        unlocked_features: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldPoints = user.total_points;
    const oldLevel = user.level;
    const newTotalPoints = oldPoints + points;

    // Calculate new level
    const newLevelConfig = this.calculateLevel(newTotalPoints);
    const newLevel = newLevelConfig.level;
    const leveledUp = newLevel > oldLevel;

    // Update user
    const updated = await prisma.user.update({
      where: { user_id: userId },
      data: {
        total_points: newTotalPoints,
        level: newLevel,
        unlocked_features: newLevelConfig.features,
      },
    });

    // Log points award
    await prisma.auditEvent.create({
      data: {
        entity: 'User',
        entity_id: userId,
        action: 'points_awarded',
        payload: {
          points,
          reason,
          awarded_by: awardedBy,
          old_total: oldPoints,
          new_total: newTotalPoints,
        },
      },
    });

    let certificateIssued = null;

    // Issue certificate if leveled up
    if (leveledUp && newLevelConfig.certificateTitle) {
      certificateIssued = await this.issueLevelCertificate(
        userId,
        newLevelConfig
      );
    }

    return {
      leveledUp,
      oldLevel,
      newLevel,
      newTotalPoints,
      certificateIssued,
    };
  },

  /**
   * Issue a certificate for reaching a level
   */
  async issueLevelCertificate(userId: string, levelConfig: UnlockConfig) {
    const signedToken = this.generateCertificateToken(userId, levelConfig.level);

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        title: levelConfig.certificateTitle || `Level ${levelConfig.level} erreicht`,
        description: `Sie haben Level ${levelConfig.level} (${levelConfig.title}) erreicht und folgende Features freigeschaltet: ${levelConfig.features.join(', ')}`,
        signed_token: signedToken,
        issued_by: 'Schuldenkompass System',
      },
    });

    return certificate;
  },

  /**
   * Generate a cryptographically signed certificate token
   */
  generateCertificateToken(userId: string, level: number): string {
    const payload = {
      userId,
      level,
      issuedAt: new Date().toISOString(),
      issuer: 'Schuldenkompass',
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '10y', // Certificates don't expire
    });
  },

  /**
   * Verify a certificate token
   */
  verifyCertificateToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if user has access to a feature
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        unlocked_features: true,
      },
    });

    if (!user) {
      return false;
    }

    const features = user.unlocked_features as string[] | null;
    return features?.includes(feature) || false;
  },

  /**
   * Get user's current progress to next level
   */
  async getLevelProgress(userId: string) {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        level: true,
        total_points: true,
        unlocked_features: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentLevelConfig = LEVEL_SYSTEM.find(l => l.level === user.level) || LEVEL_SYSTEM[0];
    const nextLevel = this.getNextLevel(user.level);

    let progressPercent = 100;
    let pointsToNextLevel = 0;

    if (nextLevel) {
      const pointsSinceCurrentLevel = user.total_points - currentLevelConfig.requiredPoints;
      const pointsNeededForNext = nextLevel.requiredPoints - currentLevelConfig.requiredPoints;
      progressPercent = Math.round((pointsSinceCurrentLevel / pointsNeededForNext) * 100);
      pointsToNextLevel = nextLevel.requiredPoints - user.total_points;
    }

    return {
      currentLevel: user.level,
      currentLevelTitle: currentLevelConfig.title,
      totalPoints: user.total_points,
      nextLevel: nextLevel?.level || null,
      nextLevelTitle: nextLevel?.title || null,
      pointsToNextLevel,
      progressPercent,
      unlockedFeatures: user.unlocked_features as string[],
      nextLevelFeatures: nextLevel?.features || [],
    };
  },
};
