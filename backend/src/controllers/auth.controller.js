const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const spotifyConfig = require('../config/spotify.config');
const { getCredentialStatus } = require('../utils/validation.util');

class AuthController {
  initiateSpotifyAuth(req, res) {
    const credentialStatus = getCredentialStatus();
    
    if (!credentialStatus.valid) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Spotify authentication is not properly configured',
          details: credentialStatus.message,
          instructions: [
            '1. Go to https://developer.spotify.com/dashboard',
            '2. Select your app and click "Settings"',
            '3. Copy the complete Client ID (must be 32 characters)',
            '4. Copy the complete Client Secret (must be 32 characters)',
            '5. Update your backend/.env file with the correct values',
            '6. Ensure Redirect URI is set to: http://localhost:3000/auth/spotify/callback',
            '7. Restart the backend server'
          ]
        }
      });
    }

    const state = crypto.randomBytes(16).toString('hex');
    req.session.spotifyState = state;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: spotifyConfig.clientId,
      scope: spotifyConfig.scopes.join(' '),
      redirect_uri: spotifyConfig.redirectUri,
      state: state
    });

    const authUrl = `${spotifyConfig.endpoints.authorize}?${params.toString()}`;
    res.json({ success: true, authUrl });
  }

  async handleSpotifyCallback(req, res) {
    const { code, state, error } = req.query;

    if (error) {
      console.error('Spotify OAuth error:', error);
      return res.redirect(`/?error=spotify_auth_failed&reason=${encodeURIComponent(error)}`);
    }

    if (!state || state !== req.session.spotifyState) {
      console.error('State mismatch in Spotify callback');
      return res.redirect('/?error=spotify_auth_failed&reason=state_mismatch');
    }

    try {
      const credentials = Buffer.from(
        `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        spotifyConfig.endpoints.token,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: spotifyConfig.redirectUri
        }),
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      req.session.spotifyToken = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: Date.now() + (response.data.expires_in * 1000)
      };

      delete req.session.spotifyState;

      res.redirect('/?spotify=connected');
    } catch (error) {
      console.error('Spotify token exchange error:', error.response?.data || error.message);
      
      const errorDetail = error.response?.data?.error || 'token_exchange_failed';
      const errorDescription = error.response?.data?.error_description || 'Failed to exchange authorization code for access token';
      
      console.error('Error details:', {
        error: errorDetail,
        description: errorDescription,
        clientIdLength: spotifyConfig.clientId?.length,
        clientSecretLength: spotifyConfig.clientSecret?.length,
        redirectUri: spotifyConfig.redirectUri
      });
      
      res.redirect(`/?error=spotify_auth_failed&reason=${encodeURIComponent(errorDetail)}&details=${encodeURIComponent(errorDescription)}`);
    }
  }

  initiateYouTubeMusicAuth(req, res) {
    const authFile = path.join(__dirname, '../../../python-service/auth/ytmusic_auth.json');
    
    if (fs.existsSync(authFile)) {
      req.session.youtubeMusicAuthenticated = true;
      res.json({ 
        success: true, 
        authenticated: true,
        message: 'YouTube Music already authenticated',
        setupRequired: false
      });
    } else {
      res.json({ 
        success: false, 
        authenticated: false,
        message: 'YouTube Music authentication required. Please run: cd python-service && python3 auth_setup.py',
        setupRequired: true,
        instructions: [
          '1. Open terminal',
          '2. cd python-service',
          '3. python3 -m venv venv',
          '4. source venv/bin/activate  (or venv\\Scripts\\activate on Windows)',
          '5. pip install -r requirements.txt',
          '6. python3 auth_setup.py'
        ]
      });
    }
  }

  checkYouTubeMusicAuth(req, res) {
    const authFile = path.join(__dirname, '../../../python-service/auth/ytmusic_auth.json');
    const isAuthenticated = fs.existsSync(authFile);
    
    if (isAuthenticated) {
      req.session.youtubeMusicAuthenticated = true;
    }
    
    res.json({ 
      success: true, 
      authenticated: isAuthenticated,
      setupRequired: !isAuthenticated
    });
  }

  getAuthStatus(req, res) {
    const authFile = path.join(__dirname, '../../../python-service/auth/ytmusic_auth.json');
    const youtubeMusicAuth = fs.existsSync(authFile);
    
    res.json({
      success: true,
      authenticated: {
        spotify: !!req.session.spotifyToken,
        youtubeMusic: youtubeMusicAuth
      }
    });
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: { message: 'Failed to logout' }
        });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  }
}

module.exports = new AuthController();