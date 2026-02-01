import crypto from 'crypto';

/**
 * Video Service für Meeting-Link-Generierung
 * Unterstützt: Daily.co und Jitsi
 */

export interface VideoMeetingConfig {
  appointmentId: string;
  userId: string;
  advisorId?: string;
  duration?: number; // in minutes, default 60
}

export interface VideoMeetingLink {
  meetingUrl: string;
  provider: 'daily' | 'jitsi';
  expiresAt?: Date;
  roomName: string;
}

export const videoService = {
  /**
   * Generate a unique meeting link for an appointment
   */
  async generateMeetingLink(config: VideoMeetingConfig): Promise<VideoMeetingLink> {
    const provider = process.env.VIDEO_PROVIDER || 'jitsi';

    if (provider === 'daily') {
      return this.generateDailyLink(config);
    } else {
      return this.generateJitsiLink(config);
    }
  },

  /**
   * Generate Daily.co meeting room
   * Requires DAILY_API_KEY in environment
   */
  async generateDailyLink(config: VideoMeetingConfig): Promise<VideoMeetingLink> {
    const apiKey = process.env.DAILY_API_KEY;

    if (!apiKey) {
      throw new Error('DAILY_API_KEY not configured. Using Jitsi fallback.');
    }

    const roomName = this.generateRoomName(config.appointmentId);
    const duration = config.duration || 60; // minutes
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    try {
      // Create Daily.co room via API
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            max_participants: 2,
            enable_screenshare: true,
            enable_chat: true,
            enable_recording: 'cloud', // Optional
            start_video_off: false,
            start_audio_off: false,
            exp: Math.floor(expiresAt.getTime() / 1000), // Expiration timestamp
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Daily.co API error:', error);
        // Fallback to Jitsi
        return this.generateJitsiLink(config);
      }

      const room = await response.json();

      return {
        meetingUrl: room.url,
        provider: 'daily',
        expiresAt,
        roomName,
      };
    } catch (error) {
      console.error('Failed to create Daily.co room:', error);
      // Fallback to Jitsi
      return this.generateJitsiLink(config);
    }
  },

  /**
   * Generate Jitsi meeting link (free, no API key required)
   */
  generateJitsiLink(config: VideoMeetingConfig): VideoMeetingLink {
    const roomName = this.generateRoomName(config.appointmentId);
    const duration = config.duration || 60;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    // Jitsi Meet URL format: https://meet.jit.si/{roomName}
    const meetingUrl = `https://meet.jit.si/${roomName}`;

    return {
      meetingUrl,
      provider: 'jitsi',
      expiresAt,
      roomName,
    };
  },

  /**
   * Generate a unique, secure room name
   */
  generateRoomName(appointmentId: string): string {
    // Format: schuldenkompass-{appointmentId-short}-{random}
    const shortId = appointmentId.slice(0, 8);
    const random = crypto.randomBytes(4).toString('hex');
    return `schuldenkompass-${shortId}-${random}`;
  },

  /**
   * Delete a Daily.co room (cleanup after appointment)
   */
  async deleteDailyRoom(roomName: string): Promise<boolean> {
    const apiKey = process.env.DAILY_API_KEY;

    if (!apiKey) {
      console.warn('DAILY_API_KEY not configured. Cannot delete room.');
      return false;
    }

    try {
      const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete Daily.co room:', error);
      return false;
    }
  },

  /**
   * Generate meeting token for Daily.co (for auth/permissions)
   */
  async generateDailyToken(roomName: string, userId: string): Promise<string> {
    const apiKey = process.env.DAILY_API_KEY;

    if (!apiKey) {
      throw new Error('DAILY_API_KEY not configured');
    }

    try {
      const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            user_id: userId,
            is_owner: false,
            enable_recording: 'cloud',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meeting token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Failed to generate Daily.co token:', error);
      throw error;
    }
  },
};
