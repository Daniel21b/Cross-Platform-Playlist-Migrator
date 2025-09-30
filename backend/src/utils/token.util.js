const axios = require('axios');
const spotifyConfig = require('../config/spotify.config');
const youtubeConfig = require('../config/youtube.config');

class TokenManager {
  static async refreshSpotifyToken(refreshToken) {
    try {
      const credentials = Buffer.from(
        `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        spotifyConfig.endpoints.token,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        refreshToken: response.data.refresh_token || refreshToken
      };
    } catch (error) {
      throw new Error(`Failed to refresh Spotify token: ${error.message}`);
    }
  }

  static async refreshYouTubeToken(refreshToken) {
    try {
      const response = await axios.post(
        youtubeConfig.endpoints.token,
        {
          client_id: youtubeConfig.clientId,
          client_secret: youtubeConfig.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }
      );

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      throw new Error(`Failed to refresh YouTube token: ${error.message}`);
    }
  }

  static isTokenExpired(expiresAt) {
    if (!expiresAt) return true;
    const buffer = 5 * 60 * 1000;
    return Date.now() >= expiresAt - buffer;
  }

  static async ensureValidToken(session, platform) {
    if (platform === 'youtubeMusic') {
      return null;
    }
    
    const tokenData = session[`${platform}Token`];
    
    if (!tokenData) {
      throw new Error(`No ${platform} token found. Please authenticate first.`);
    }

    if (this.isTokenExpired(tokenData.expiresAt)) {
      if (!tokenData.refreshToken) {
        throw new Error(`${platform} token expired and no refresh token available.`);
      }

      const refreshed = platform === 'spotify' 
        ? await this.refreshSpotifyToken(tokenData.refreshToken)
        : await this.refreshYouTubeToken(tokenData.refreshToken);

      session[`${platform}Token`] = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken || tokenData.refreshToken,
        expiresAt: Date.now() + (refreshed.expiresIn * 1000)
      };
    }

    return session[`${platform}Token`].accessToken;
  }
}

module.exports = TokenManager;
