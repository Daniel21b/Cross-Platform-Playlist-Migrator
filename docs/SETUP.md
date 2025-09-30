# Setup Guide

Complete setup instructions for the Cross-Platform Playlist Migrator.

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create .env file from template
cp env.example .env

# 3. Configure your API credentials (see below)
# Edit .env with your Spotify and YouTube credentials

# 4. Start the server
npm start

# 5. Open browser
open http://localhost:3000
```

---

## Detailed Setup

### 1. Prerequisites

- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Spotify Developer Account**
- **Google Cloud Platform Account**

---

### 2. Getting API Credentials

#### Spotify API Setup

1. **Create Spotify Developer Account**
   - Visit https://developer.spotify.com/dashboard
   - Log in with your Spotify account
   - Accept the Terms of Service

2. **Create an App**
   - Click "Create an App"
   - Name: `Playlist Migrator` (or your choice)
   - Description: `Cross-platform playlist migration tool`
   - Accept the Developer Terms
   - Click "Create"

3. **Configure App Settings**
   - Click "Edit Settings"
   - Add Redirect URI: `http://localhost:3000/auth/spotify/callback`
   - Click "Add"
   - Click "Save" at the bottom

4. **Get Credentials**
   - Go back to your app dashboard
   - Copy **Client ID**
   - Click "Show Client Secret"
   - Copy **Client Secret**
   - Keep these secure!

#### YouTube API Setup

1. **Create Google Cloud Project**
   - Visit https://console.cloud.google.com/
   - Click "Select a project" → "New Project"
   - Project name: `Playlist Migrator`
   - Click "Create"

2. **Enable YouTube Data API**
   - In the search bar, type "YouTube Data API v3"
   - Click on "YouTube Data API v3"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: `Playlist Migrator`
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Click "Save and Continue" (we'll set scopes in code)
     - Test users: Add your Google email
     - Click "Save and Continue"
   - Application type: **Web application**
   - Name: `Playlist Migrator`
   - Authorized redirect URIs:
     - Add: `http://localhost:3000/auth/youtube/callback`
   - Click "Create"

4. **Get Credentials**
   - Copy **Client ID**
   - Copy **Client Secret**
   - Keep these secure!

---

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=3000
NODE_ENV=development
SESSION_SECRET=generate-a-random-string-here

# Spotify
SPOTIFY_CLIENT_ID=paste_your_spotify_client_id
SPOTIFY_CLIENT_SECRET=paste_your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# YouTube
YOUTUBE_CLIENT_ID=paste_your_youtube_client_id
YOUTUBE_CLIENT_SECRET=paste_your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback

# Frontend
FRONTEND_URL=http://localhost:3000
```

**Generating a Session Secret:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use any random string
```

---

### 4. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `axios` - HTTP client
- `express-session` - Session management
- `dotenv` - Environment variables
- `cors` - CORS support

---

### 5. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
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

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
1. Change `PORT` in `.env` to another port (e.g., 3001)
2. Update redirect URIs in both Spotify and Google Cloud Console

### "Invalid Client" Error (Spotify)

- Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct
- Check redirect URI is exactly: `http://localhost:3000/auth/spotify/callback`
- Ensure no trailing spaces in credentials

### "Invalid Client" Error (YouTube)

- Verify `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` are correct
- Check redirect URI is exactly: `http://localhost:3000/auth/youtube/callback`
- Ensure YouTube Data API v3 is enabled
- Check OAuth consent screen is configured

### "Access Blocked" (YouTube)

- Make sure your Google account is added as a test user in OAuth consent screen
- Verify app is in "Testing" mode (not "In Production")

### Session Not Persisting

- Check `SESSION_SECRET` is set in `.env`
- Clear browser cookies and try again
- Make sure you're not in incognito/private mode

---

## Project Structure

```
Cross-Platform-Playlist-Migrator/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── package.json
│   ├── .env                 # Your environment variables
│   └── env.example          # Environment template
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── api.js
│   │   └── main.js
│   └── index.html
├── docs/
│   ├── API_TESTING.md       # API testing guide
│   └── SETUP.md             # This file
└── README.md
```

---

## Development Workflow

### Testing Backend Only

See `docs/API_TESTING.md` for detailed instructions on testing all API endpoints independently.

### Full Stack Development

1. Start backend server: `npm start` (in backend directory)
2. Open `http://localhost:3000` in browser
3. The server serves both API and frontend

### Making Changes

- **Backend changes**: Restart server (or use `npm run dev` for auto-reload)
- **Frontend changes**: Just refresh browser

---

## Next Steps

1. ✅ Complete setup
2. 📖 Read `API_TESTING.md` to understand the API
3. 🧪 Test backend endpoints independently
4. 🎨 Use the frontend interface
5. 🚀 Start migrating playlists!

---

## Security Notes

- **Never commit `.env` file** - It's already in `.gitignore`
- **Keep credentials secure** - Don't share them publicly
- **Use strong session secret** - Generate a random string
- **Production deployment** - Use HTTPS and secure session cookies

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review `API_TESTING.md` for endpoint details
3. Check server console logs for error messages
4. Verify API credentials and configurations
