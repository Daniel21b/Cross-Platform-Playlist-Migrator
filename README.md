# Cross-Platform Playlist Migrator

A professional web application for migrating playlists between music streaming platforms (Spotify ⟷ YouTube Music).

Built with a **backend-first architecture** focusing on robust OAuth 2.0 implementation, async API operations, and **Python-Node.js hybrid architecture** for YouTube Music integration.

---

## Features

### Backend (Core Focus)
- ✅ **OAuth 2.0 Authentication** - Complete implementation for Spotify and YouTube
- ✅ **Token Management** - Automatic token refresh and session handling
- ✅ **Async Operations** - Non-blocking API calls using async/await
- ✅ **Smart Track Matching** - Fuzzy search algorithm for cross-platform matching
- ✅ **Migration Service** - Real-time progress tracking with detailed status
- ✅ **RESTful API** - Clean, well-documented endpoints
- ✅ **Error Handling** - Comprehensive error handling and validation

### Frontend (Minimalist & Professional)
- ✅ **Clean Design** - Dark theme with professional color palette
- ✅ **Responsive Layout** - Works on desktop and mobile
- ✅ **Real-time Updates** - Live migration progress with track-by-track status
- ✅ **Vanilla JavaScript** - No frameworks, lightweight and fast
- ✅ **Smooth UX** - Subtle transitions, no distracting animations

---

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Axios** - HTTP client for API calls
- **express-session** - Session management
- **dotenv** - Environment configuration
- **Python 3** - YouTube Music service layer
- **ytmusicapi** - Unofficial YouTube Music API

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - ES6+ features

### APIs
- **Spotify Web API** - Official playlist and track operations
- **ytmusicapi (Python)** - Reverse-engineered YouTube Music API

---

## Project Structure

```
Cross-Platform-Playlist-Migrator/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── server.config.js      # Server configuration
│   │   │   ├── spotify.config.js     # Spotify API config
│   │   │   └── youtube.config.js     # YouTube API config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # OAuth flow handlers
│   │   │   └── migration.controller.js # Migration endpoints
│   │   ├── services/
│   │   │   ├── spotify.service.js    # Spotify API operations
│   │   │   ├── youtube.service.js    # YouTube API operations
│   │   │   └── migration.service.js  # Migration orchestration
│   │   ├── utils/
│   │   │   ├── token.util.js         # Token refresh logic
│   │   │   └── search.util.js        # Track matching algorithms
│   │   ├── middleware/
│   │   │   ├── error.middleware.js   # Error handling
│   │   │   └── session.middleware.js # Auth middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Auth endpoints
│   │   │   └── api.routes.js         # API endpoints
│   │   ├── app.js                    # Express app setup
│   │   └── server.js                 # Server entry point
│   ├── package.json
│   ├── .env                          # Your credentials (create this)
│   └── env.example                   # Environment template
├── frontend/
│   ├── css/
│   │   └── styles.css               # Professional styling
│   ├── js/
│   │   ├── api.js                   # API client
│   │   └── main.js                  # Application logic
│   └── index.html                   # Single page app
├── docs/
│   ├── API_TESTING.md               # Backend testing guide
│   └── SETUP.md                     # Detailed setup instructions
└── README.md                         # This file
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file in `backend` directory:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-random-secret-key

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

YOUTUBE_MUSIC_AUTH_FILE=./python-service/auth/ytmusic_auth.json

FRONTEND_URL=http://localhost:3000
```

### 3. Get API Credentials

#### Spotify:
1. Go to https://developer.spotify.com/dashboard
2. Create app and get credentials
3. Add redirect URI: `http://localhost:3000/auth/spotify/callback`

#### YouTube Music:
YouTube Music uses browser-based authentication (no OAuth credentials needed):
```bash
cd python-service
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 auth_setup.py
```

See `docs/YOUTUBE_MUSIC_SETUP.md` for detailed instructions.

### 4. Start the Server

```bash
npm start
```

### 5. Open Browser

```
http://localhost:3000
```

---

## API Endpoints

### Authentication
```
GET  /auth/spotify              # Initiate Spotify OAuth
GET  /auth/spotify/callback     # Spotify callback
GET  /auth/youtube              # Initiate YouTube OAuth
GET  /auth/youtube/callback     # YouTube callback
GET  /auth/status               # Check auth status
POST /auth/logout               # Logout
```

### Playlists
```
GET  /api/playlists/:platform              # Get user playlists
GET  /api/playlist/:platform/:id/tracks    # Get playlist tracks
```

### Migration
```
POST /api/migrate                # Start migration
GET  /api/migrate/status/:id     # Check migration status
```

---

## Testing the Backend Independently

The backend can be fully tested **before** using the frontend:

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Get auth status
curl http://localhost:3000/auth/status

# Get Spotify auth URL
curl http://localhost:3000/auth/spotify
# Open the returned URL in browser to authenticate
```

### Using Postman

See `docs/API_TESTING.md` for complete Postman collection and testing workflow.

**Key Testing Features:**
- Test all endpoints independently
- Verify OAuth flows work correctly
- Check token refresh mechanism
- Test migration logic with real data
- Monitor progress tracking

---

## How It Works

### 1. Authentication Flow
```
User → Click Connect → Server generates OAuth URL → 
User authorizes on platform → Callback with code → 
Server exchanges code for tokens → Tokens stored in session
```

### 2. Migration Flow
```
User selects playlist → Server fetches all tracks → 
For each track:
  - Extract artist and title
  - Search on destination platform
  - Calculate match score
  - Select best match
→ Create new playlist on destination →
Add all matched tracks → Return results
```

### 3. Token Management
```
Every API call:
  - Check if token exists
  - Check if token expired
  - If expired: refresh token
  - Use valid token for API call
```

---

## Architecture Highlights

### Backend Design Principles
- **Separation of Concerns** - Controllers, services, and utilities clearly separated
- **Single Responsibility** - Each module has one clear purpose
- **Async/Await** - All I/O operations are non-blocking
- **Error Handling** - Try-catch blocks with meaningful error messages
- **Token Refresh** - Automatic and transparent to the user
- **Session Management** - Secure cookie-based sessions

### Frontend Design Principles
- **State Management** - Simple object-based state
- **Event-Driven** - User actions trigger API calls
- **Progressive Enhancement** - Features appear as authentication completes
- **Real-time Feedback** - Live updates during migration
- **Error Recovery** - Graceful error handling with user feedback

---

## Key Features Explained

### OAuth 2.0 Implementation
- **Authorization Code Flow** - Most secure OAuth flow
- **State Parameter** - CSRF protection
- **Token Storage** - Server-side session storage (secure)
- **Automatic Refresh** - Tokens refresh before expiry
- **Scope Management** - Requests only necessary permissions

### Track Matching Algorithm
```javascript
1. Normalize strings (lowercase, remove special chars)
2. Build multiple search queries:
   - "Artist Name - Song Title"
   - "Song Title"
3. Search destination platform
4. Score each result:
   - Title match: 50 points
   - Exact title: +30 points
   - Artist match: +20 points
5. Return best match (score ≥ 50)
```

### Migration Service
- **Async Processing** - Non-blocking migration
- **Progress Tracking** - Real-time status updates
- **Error Resilience** - Continues even if some tracks fail
- **Result Details** - Track-by-track status (matched/failed)
- **Performance** - Processes tracks sequentially to respect rate limits

---

## Development

### Run with Auto-reload
```bash
npm run dev
```

### Project Scripts
```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `SESSION_SECRET` - Session encryption key
- `*_CLIENT_ID` - OAuth client IDs
- `*_CLIENT_SECRET` - OAuth client secrets
- `*_REDIRECT_URI` - OAuth callback URLs

---

## Security Considerations

### Implemented Security Measures
- ✅ Server-side session storage (tokens never sent to client)
- ✅ HTTP-only session cookies
- ✅ CSRF protection with state parameter
- ✅ Credentials never logged or exposed
- ✅ CORS configuration for frontend
- ✅ Input validation and sanitization

### Production Recommendations
- Use HTTPS (required for OAuth in production)
- Set `secure: true` for session cookies
- Use environment-specific secrets
- Implement rate limiting
- Add request logging
- Use a production-grade session store (Redis)

---

## Troubleshooting

### "Invalid client" error
- Verify credentials in `.env` match developer console
- Check redirect URIs match exactly (no trailing slashes)

### "Not authenticated" error
- Complete OAuth flow for required platform
- Check browser allows cookies
- Verify session secret is set

### Migration fails to start
- Ensure both platforms are connected
- Check source playlist has valid tracks
- Verify playlist ID is correct

### Tracks not matching
- Some tracks may not be available on destination platform
- Local files (Spotify) cannot be migrated
- Private/deleted videos (YouTube) are skipped

See `docs/API_TESTING.md` and `docs/SETUP.md` for more troubleshooting.

---

## Future Enhancements

Potential additions:
- [ ] Support for Apple Music
- [ ] Bulk playlist migration
- [ ] Scheduled migrations
- [ ] Migration history
- [ ] User preferences storage
- [ ] Advanced matching options
- [ ] Playlist synchronization
- [ ] Export/import functionality

---

## License

MIT License - Feel free to use this project for learning or personal use.

---

## Acknowledgments

- **Spotify Web API** - https://developer.spotify.com/
- **YouTube Data API** - https://developers.google.com/youtube/

---

## Contact

For questions or issues, please check:
1. `docs/SETUP.md` - Setup and configuration
2. `docs/API_TESTING.md` - API testing guide
3. Server console logs - Error messages and debugging info

---

**Built with focus on backend architecture, OAuth security, and clean code principles.**
