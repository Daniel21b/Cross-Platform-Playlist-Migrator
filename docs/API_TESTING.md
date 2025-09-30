# API Testing Guide

This guide provides step-by-step instructions for testing all backend API endpoints independently using `curl` or Postman **before** building the frontend.

## Prerequisites

1. **Node.js** installed (v14 or higher)
2. **Spotify Developer Account** and App credentials
3. **Google Cloud Platform** account with YouTube Data API enabled
4. **curl** installed (comes with macOS/Linux) or **Postman**

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-super-secret-key-change-this

SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

YOUTUBE_CLIENT_ID=your_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback

FRONTEND_URL=http://localhost:3000
```

### 3. Getting API Credentials

#### Spotify:
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Copy Client ID and Client Secret
4. Add redirect URI: `http://localhost:3000/auth/spotify/callback`

#### YouTube (Google):
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI: `http://localhost:3000/auth/youtube/callback`
6. Copy Client ID and Client Secret

### 4. Start the Server

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

## Testing Endpoints

### Step 1: Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-09-30T..."
}
```

---

### Step 2: Check Authentication Status

```bash
curl http://localhost:3000/auth/status
```

**Expected Response (before authentication):**
```json
{
  "success": true,
  "authenticated": {
    "spotify": false,
    "youtube": false
  }
}
```

---

### Step 3: Authenticate with Spotify

#### Get Auth URL:

```bash
curl http://localhost:3000/auth/spotify
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://accounts.spotify.com/authorize?..."
}
```

#### Complete Authentication:
1. Copy the `authUrl` from the response
2. Open it in a browser
3. Log in to Spotify and authorize the app
4. You'll be redirected back to `http://localhost:3000/?spotify=connected`

**Note:** The session cookie is stored in your browser. To test with curl, you need to extract and use session cookies (see Postman method below).

---

### Step 4: Authenticate with YouTube

#### Get Auth URL:

```bash
curl http://localhost:3000/auth/youtube
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### Complete Authentication:
1. Copy the `authUrl` from the response
2. Open it in a browser
3. Log in to Google and authorize the app
4. You'll be redirected back to `http://localhost:3000/?youtube=connected`

---

### Step 5: Verify Authentication Status

After completing both OAuth flows in the browser:

```bash
curl http://localhost:3000/auth/status \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "authenticated": {
    "spotify": true,
    "youtube": true
  }
}
```

---

## Testing with Postman (Recommended for Full Testing)

### Setup Postman

1. **Import Collection**: Create a new collection named "Playlist Migrator"
2. **Configure Collection Variables**:
   - `base_url`: `http://localhost:3000`

### Configure Cookies

Postman automatically manages cookies, making testing much easier than curl.

### Endpoints to Test in Order:

#### 1. Health Check
```
GET {{base_url}}/health
```

#### 2. Initiate Spotify Auth
```
GET {{base_url}}/auth/spotify
```
- Copy the `authUrl` and visit it in a browser
- Complete the OAuth flow

#### 3. Initiate YouTube Auth
```
GET {{base_url}}/auth/youtube
```
- Copy the `authUrl` and visit it in a browser
- Complete the OAuth flow

#### 4. Check Auth Status
```
GET {{base_url}}/auth/status
```

#### 5. Get Spotify Playlists
```
GET {{base_url}}/api/playlists/spotify
```

**Expected Response:**
```json
{
  "success": true,
  "platform": "spotify",
  "playlists": [
    {
      "id": "playlist_id_here",
      "name": "My Awesome Playlist",
      "description": "...",
      "tracksCount": 25,
      "imageUrl": "...",
      "public": true,
      "owner": "username"
    }
  ]
}
```

#### 6. Get YouTube Playlists
```
GET {{base_url}}/api/playlists/youtube
```

#### 7. Get Playlist Tracks
```
GET {{base_url}}/api/playlist/spotify/{playlist_id}/tracks
```

Replace `{playlist_id}` with an actual playlist ID from step 5.

**Expected Response:**
```json
{
  "success": true,
  "platform": "spotify",
  "playlistId": "...",
  "tracks": [
    {
      "id": "track_id",
      "name": "Song Name",
      "artists": [
        {"id": "...", "name": "Artist Name"}
      ],
      "album": "Album Name",
      "duration": 240000,
      "uri": "spotify:track:..."
    }
  ]
}
```

#### 8. Start Migration
```
POST {{base_url}}/api/migrate
Content-Type: application/json

{
  "source": "spotify",
  "destination": "youtube",
  "playlistId": "your_spotify_playlist_id",
  "playlistName": "My Awesome Playlist"
}
```

**Expected Response:**
```json
{
  "success": true,
  "migrationId": "migration_1234567890_abc123",
  "status": "started"
}
```

#### 9. Check Migration Status
```
GET {{base_url}}/api/migrate/status/{migrationId}
```

Replace `{migrationId}` with the ID from step 8.

**Expected Response (in progress):**
```json
{
  "success": true,
  "migration": {
    "id": "migration_1234567890_abc123",
    "status": "in_progress",
    "progress": {
      "total": 25,
      "processed": 10,
      "matched": 9,
      "failed": 1
    },
    "tracks": [
      {
        "original": {
          "name": "Song Name",
          "artist": "Artist Name"
        },
        "matched": {
          "name": "Song Name - Artist Name",
          "artist": "Artist Name",
          "id": "youtube_video_id"
        },
        "status": "matched"
      }
    ],
    "duration": 45000
  }
}
```

**Expected Response (completed):**
```json
{
  "success": true,
  "migration": {
    "id": "migration_1234567890_abc123",
    "status": "completed",
    "progress": {
      "total": 25,
      "processed": 25,
      "matched": 23,
      "failed": 2
    },
    "destinationPlaylistId": "youtube_playlist_id",
    "destinationPlaylistUrl": "https://www.youtube.com/playlist?list=...",
    "duration": 120000
  }
}
```

---

## Error Responses

### 401 Unauthorized (Not Authenticated)
```json
{
  "success": false,
  "error": {
    "message": "Not authenticated with spotify. Please authenticate first.",
    "code": "AUTH_REQUIRED",
    "platform": "spotify"
  }
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Both source and destination platforms are required"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Migration not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Failed to fetch Spotify playlists: ..."
  }
}
```

---

## Testing Workflow Example

Here's a complete testing workflow:

1. **Start Server**: `npm start`
2. **Health Check**: Verify server is running
3. **Spotify Auth**: Get auth URL → Visit in browser → Complete OAuth
4. **YouTube Auth**: Get auth URL → Visit in browser → Complete OAuth
5. **List Spotify Playlists**: Get all user playlists
6. **Select Playlist**: Note a playlist ID
7. **Get Tracks**: Fetch all tracks from selected playlist
8. **Start Migration**: POST to `/api/migrate` with playlist details
9. **Poll Status**: Repeatedly GET migration status until completed
10. **Verify**: Check YouTube for the new playlist

---

## Tips for Testing

1. **Use Postman Collections**: Save all requests for easy reuse
2. **Session Persistence**: Postman handles cookies automatically
3. **Monitor Console**: Check server logs for detailed error messages
4. **Rate Limits**: Be aware of API rate limits (especially YouTube)
5. **Token Expiry**: Tokens auto-refresh, but re-authenticate if needed

---

## Troubleshooting

### "Not authenticated" errors
- Complete the OAuth flow for the required platform
- Check that cookies are being sent with requests
- Verify `.env` file has correct credentials

### "Invalid client" errors
- Verify Client ID and Secret in `.env`
- Check redirect URIs match exactly in developer consoles

### "Token expired" errors
- The backend auto-refreshes tokens
- If persists, re-authenticate through OAuth flow

### Migration fails
- Check that source playlist has valid, non-local tracks
- Verify both platforms are authenticated
- Check API rate limits in server logs

---

## Next Steps

Once all API endpoints are tested and working:
1. ✅ Backend is complete and verified
2. ⏭️ Proceed to frontend development
3. 🎨 Build the UI to consume these endpoints

The frontend will simply call these same endpoints using `fetch()` with credentials included.
