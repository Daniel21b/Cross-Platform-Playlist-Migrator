# Getting Started - Quick Reference

This is a condensed guide to get you up and running in 5 minutes.

---

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

---

## Step 2: Get API Credentials

### Spotify (2 minutes)
1. Visit: https://developer.spotify.com/dashboard
2. Log in and create app
3. Copy Client ID and Client Secret
4. Settings → Add Redirect URI: `http://localhost:3000/auth/spotify/callback`

### YouTube (3 minutes)
1. Visit: https://console.cloud.google.com/
2. Create project
3. Enable "YouTube Data API v3"
4. Create OAuth credentials (Web application)
5. Add redirect URI: `http://localhost:3000/auth/youtube/callback`
6. Add your email as test user in OAuth consent screen
7. Copy Client ID and Client Secret

---

## Step 3: Configure Environment

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=change-this-to-random-string

SPOTIFY_CLIENT_ID=paste_your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=paste_your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

YOUTUBE_CLIENT_ID=paste_your_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=paste_your_youtube_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback

FRONTEND_URL=http://localhost:3000
```

**Tip:** Generate a random session secret:
```bash
openssl rand -base64 32
```

---

## Step 4: Start the Server

```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║   Playlist Migrator API Server                        ║
║   Status: Running                                     ║
║   Port: 3000                                          ║
╚═══════════════════════════════════════════════════════╝
```

---

## Step 5: Use the Application

### Option A: Use the Frontend UI

1. Open browser: `http://localhost:3000`
2. Click "Connect to Spotify"
3. Click "Connect to YouTube"
4. Select source platform and playlist
5. Select destination platform
6. Click "Start Migration"
7. Watch real-time progress!

### Option B: Test Backend First (Recommended)

See `docs/API_TESTING.md` for complete backend testing instructions.

**Quick backend test:**
```bash
# Test server is running
curl http://localhost:3000/health

# Get auth status
curl http://localhost:3000/auth/status
```

---

## Common Issues

### Port 3000 in use
```bash
# Change PORT in .env to 3001
# Update redirect URIs in developer consoles to use 3001
```

### "Invalid client" error
- Double-check credentials in `.env`
- Verify redirect URIs match exactly (no extra slashes)
- Make sure no spaces around `=` in `.env` file

### YouTube "Access blocked"
- Add your Google email as test user in OAuth consent screen
- App should be in "Testing" mode, not "In production"

### Session not persisting
- Check `SESSION_SECRET` is set in `.env`
- Don't use incognito/private mode
- Clear browser cookies and try again

---

## What to Test

1. ✅ Health endpoint works
2. ✅ Both OAuth flows complete successfully
3. ✅ Can fetch playlists from both platforms
4. ✅ Can view tracks in a playlist
5. ✅ Migration completes successfully
6. ✅ New playlist appears on destination platform

---

## Next Steps

- 📖 Read `README.md` for architecture overview
- 🧪 Read `docs/API_TESTING.md` for detailed API testing
- 🔧 Read `docs/SETUP.md` for troubleshooting

---

## File Structure

```
backend/
├── src/           # All source code
├── .env          # YOUR credentials (create this)
├── env.example   # Template
└── package.json

frontend/
├── css/          # Styles
├── js/           # JavaScript
└── index.html    # Main page
```

---

## Support

If something doesn't work:
1. Check server console for error messages
2. Verify all credentials are correct
3. Make sure redirect URIs match exactly
4. Review troubleshooting in `docs/SETUP.md`

---

**You're ready to migrate playlists! 🎵**
