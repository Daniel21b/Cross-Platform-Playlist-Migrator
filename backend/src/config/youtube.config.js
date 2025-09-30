require('dotenv').config();

module.exports = {
  authFile: process.env.YOUTUBE_MUSIC_AUTH_FILE || './python-service/auth/ytmusic_auth.json',
  
  endpoints: {
    web: 'https://music.youtube.com'
  },
  
  pythonService: {
    path: './python-service',
    venv: './python-service/venv'
  }
};