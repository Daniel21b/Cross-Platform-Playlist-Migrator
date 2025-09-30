const validateSpotifyCredentials = (clientId, clientSecret, redirectUri) => {
  const errors = [];
  
  if (!clientId) {
    errors.push('SPOTIFY_CLIENT_ID is not set in .env file');
  } else if (clientId.length !== 32) {
    errors.push(`SPOTIFY_CLIENT_ID has invalid length (${clientId.length} chars, expected 32). Please copy the complete Client ID from Spotify Developer Dashboard.`);
  } else if (!/^[a-f0-9]{32}$/i.test(clientId)) {
    errors.push('SPOTIFY_CLIENT_ID contains invalid characters. Must be 32-character hexadecimal string.');
  }
  
  if (!clientSecret) {
    errors.push('SPOTIFY_CLIENT_SECRET is not set in .env file');
  } else if (clientSecret.length !== 32) {
    errors.push(`SPOTIFY_CLIENT_SECRET has invalid length (${clientSecret.length} chars, expected 32). Please copy the complete Client Secret from Spotify Developer Dashboard.`);
  } else if (!/^[a-f0-9]{32}$/i.test(clientSecret)) {
    errors.push('SPOTIFY_CLIENT_SECRET contains invalid characters. Must be 32-character hexadecimal string.');
  }
  
  if (!redirectUri) {
    errors.push('SPOTIFY_REDIRECT_URI is not set in .env file');
  } else {
    try {
      new URL(redirectUri);
      if (!redirectUri.includes('/auth/spotify/callback')) {
        errors.push('SPOTIFY_REDIRECT_URI should end with /auth/spotify/callback');
      }
    } catch (e) {
      errors.push('SPOTIFY_REDIRECT_URI is not a valid URL');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const validateEnvironment = () => {
  const requiredVars = [
    'PORT',
    'SESSION_SECRET',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'SPOTIFY_REDIRECT_URI'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    valid: missing.length === 0,
    missing
  };
};

const getCredentialStatus = () => {
  const envCheck = validateEnvironment();
  
  if (!envCheck.valid) {
    return {
      valid: false,
      message: 'Missing required environment variables',
      details: {
        missing: envCheck.missing
      }
    };
  }
  
  const spotifyCheck = validateSpotifyCredentials(
    process.env.SPOTIFY_CLIENT_ID,
    process.env.SPOTIFY_CLIENT_SECRET,
    process.env.SPOTIFY_REDIRECT_URI
  );
  
  if (!spotifyCheck.valid) {
    return {
      valid: false,
      message: 'Invalid Spotify credentials',
      details: {
        errors: spotifyCheck.errors
      }
    };
  }
  
  return {
    valid: true,
    message: 'All credentials are properly configured',
    details: {
      spotify: {
        clientId: `${process.env.SPOTIFY_CLIENT_ID.substring(0, 8)}...`,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI
      }
    }
  };
};

module.exports = {
  validateSpotifyCredentials,
  validateEnvironment,
  getCredentialStatus
};
