const app = require('./app');
const serverConfig = require('./config/server.config');
const { getCredentialStatus } = require('./utils/validation.util');

const PORT = serverConfig.port;

const credentialStatus = getCredentialStatus();

if (!credentialStatus.valid) {
  console.error('\n╔════════════════════════════════════════════════════════╗');
  console.error('║  ⚠️  CONFIGURATION ERROR                                ║');
  console.error('╚════════════════════════════════════════════════════════╝\n');
  console.error(`❌ ${credentialStatus.message}\n`);
  
  if (credentialStatus.details.missing) {
    console.error('Missing environment variables:');
    credentialStatus.details.missing.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease create/update your .env file in the backend directory.');
  }
  
  if (credentialStatus.details.errors) {
    console.error('Configuration errors:');
    credentialStatus.details.errors.forEach(error => {
      console.error(`  - ${error}`);
    });
    console.error('\nTo fix:');
    console.error('  1. Go to https://developer.spotify.com/dashboard');
    console.error('  2. Select your app and click "Settings"');
    console.error('  3. Copy the complete Client ID (32 characters)');
    console.error('  4. Copy the complete Client Secret (32 characters)');
    console.error('  5. Update your backend/.env file');
    console.error('  6. Ensure Redirect URI is: http://localhost:3000/auth/spotify/callback');
    console.error('  7. Restart the server\n');
  }
  
  console.error('Server starting in degraded mode. Spotify authentication will not work.\n');
}

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   Playlist Migrator API Server                        ║
║   Status: ${credentialStatus.valid ? '✅ Running' : '⚠️  Running (Degraded)'}                       ║
║   Port: ${PORT}                                          ║
║   Environment: ${serverConfig.nodeEnv}                           ║
║   URL: http://localhost:${PORT}                          ║
╚═══════════════════════════════════════════════════════╝
  `);
  
  if (credentialStatus.valid) {
    console.log('✅ Credentials: All configured properly');
    console.log(`   Spotify Client ID: ${credentialStatus.details.spotify.clientId}`);
    console.log(`   Redirect URI: ${credentialStatus.details.spotify.redirectUri}\n`);
  } else {
    console.log('⚠️  Credentials: Configuration issues detected (see above)\n');
  }
  
  console.log('Available endpoints:');
  console.log('  GET  /health                           - Server health check');
  console.log('  GET  /health/credentials               - Check credential configuration');
  console.log('  GET  /auth/status                      - Check authentication status');
  console.log('  GET  /auth/spotify                     - Initiate Spotify OAuth');
  console.log('  GET  /auth/spotify/callback            - Spotify OAuth callback');
  console.log('  GET  /auth/youtubemusic                - Initiate YouTube Music auth');
  console.log('  GET  /auth/youtubemusic/check          - Check YouTube Music auth');
  console.log('  POST /auth/logout                      - Logout and clear session');
  console.log('  GET  /api/playlists/:platform          - Get user playlists');
  console.log('  GET  /api/playlist/:platform/:id/tracks - Get playlist tracks');
  console.log('  POST /api/migrate                      - Start playlist migration');
  console.log('  GET  /api/migrate/status/:id           - Check migration status');
  console.log('');
});
