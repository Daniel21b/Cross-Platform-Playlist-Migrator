const API = {
  baseUrl: window.location.origin,

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error?.message || 'Request failed');
        error.details = data.error?.details;
        error.instructions = data.error?.instructions;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getAuthStatus() {
    return this.request('/auth/status');
  },

  async initiateSpotifyAuth() {
    return this.request('/auth/spotify');
  },

  async initiateYouTubeMusicAuth() {
    return this.request('/auth/youtubemusic');
  },

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  },

  async getPlaylists(platform) {
    return this.request(`/api/playlists/${platform}`);
  },

  async getPlaylistTracks(platform, playlistId) {
    return this.request(`/api/playlist/${platform}/${playlistId}/tracks`);
  },

  async startMigration(migrationData) {
    return this.request('/api/migrate', {
      method: 'POST',
      body: JSON.stringify(migrationData)
    });
  },

  async getMigrationStatus(migrationId) {
    return this.request(`/api/migrate/status/${migrationId}`);
  }
};
