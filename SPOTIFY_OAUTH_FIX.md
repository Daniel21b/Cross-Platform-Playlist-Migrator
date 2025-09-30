# Spotify OAuth Configuration Fix

## Problem Summary

The application was showing an `INVALID_CLIENT` error when users tried to connect to Spotify. This was caused by an incomplete Spotify Client ID in the `.env` file (31 characters instead of the required 32 characters).

## Root Cause

Spotify requires:
- **Client ID**: Exactly 32-character hexadecimal string
- **Client Secret**: Exactly 32-character hexadecimal string
- **Redirect URI**: Must match exactly in both your `.env` file and Spotify Developer Dashboard

Your `.env` file had: `SPOTIFY_CLIENT_ID=9b0173330e914fb59da5e2f16380fdc` (31 chars - missing 1 character)

## How to Fix

### Step 1: Get Correct Credentials from Spotify

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click on your app (or create a new one if needed)
4. Click **"Settings"**
5. Copy your **Client ID** (should be exactly 32 characters)
6. Click **"View client secret"** and copy it (should be exactly 32 characters)

### Step 2: Configure Redirect URI in Spotify Dashboard

In your app's settings on Spotify Dashboard:
1. Scroll to **"Redirect URIs"**
2. Add: `http://localhost:3000/auth/spotify/callback`
3. Click **"Add"**
4. Click **"Save"** at the bottom

⚠️ **Important**: The redirect URI must match EXACTLY (no trailing slash, correct port)

### Step 3: Update Your .env File

Edit `/backend/.env` and update these lines:

```env
SPOTIFY_CLIENT_ID=<paste-your-32-character-client-id-here>
SPOTIFY_CLIENT_SECRET=<paste-your-32-character-client-secret-here>
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback
```

### Step 4: Restart the Backend Server

```bash
cd backend
# Stop the current server (Ctrl+C if running in terminal)
npm start
```

### Step 5: Verify Configuration

When the server starts, you should see:

✅ **If configured correctly:**
```
╔═══════════════════════════════════════════════════════╗
║   Playlist Migrator API Server                        ║
║   Status: ✅ Running                                   ║
║   Port: 3000                                          ║
║   Environment: development                           ║
║   URL: http://localhost:3000                          ║
╚═══════════════════════════════════════════════════════╝

✅ Credentials: All configured properly
   Spotify Client ID: 9b017333...
   Redirect URI: http://localhost:3000/auth/spotify/callback
```

❌ **If still misconfigured:**
```
╔════════════════════════════════════════════════════════╗
║  ⚠️  CONFIGURATION ERROR                                ║
╚════════════════════════════════════════════════════════╝

❌ Invalid Spotify credentials

Configuration errors:
  - SPOTIFY_CLIENT_ID has invalid length (31 chars, expected 32)...
```

## What We Implemented

To prevent this issue in the future, we added:

### 1. **Credential Validation Utility** (`backend/src/utils/validation.util.js`)
- Validates Client ID and Client Secret are exactly 32 characters
- Validates they contain only valid hexadecimal characters
- Validates Redirect URI is a valid URL
- Provides detailed error messages for each validation failure

### 2. **Server Startup Validation** (`backend/src/server.js`)
- Validates credentials when server starts
- Shows detailed error messages in console
- Displays step-by-step fix instructions
- Server runs in "degraded mode" if credentials are invalid

### 3. **Health Check Endpoint** (`GET /health/credentials`)
- Allows programmatic checking of credential status
- Returns validation results in JSON format
- Useful for debugging and monitoring

### 4. **Auth Controller Validation** (`backend/src/controllers/auth.controller.js`)
- Validates credentials before attempting OAuth flow
- Returns clear error messages to the frontend
- Prevents users from seeing Spotify's generic error page

### 5. **Frontend Error Handling** (`frontend/js/main.js`)
- Catches configuration errors from the API
- Displays user-friendly error messages
- Provides clear instructions for fixing the issue

## Testing Your Setup

### Test 1: Check Credential Status
```bash
curl http://localhost:3000/health/credentials
```

Expected response when configured correctly:
```json
{
  "success": true,
  "valid": true,
  "message": "All credentials are properly configured",
  "details": {
    "spotify": {
      "clientId": "9b017333...",
      "redirectUri": "http://localhost:3000/auth/spotify/callback"
    }
  }
}
```

### Test 2: Try Connecting to Spotify
1. Open `http://localhost:3000` in your browser
2. Click "Connect to Spotify"
3. You should be redirected to Spotify's login page (not an error page)
4. After logging in and authorizing, you should be redirected back with "Connected" status

## Understanding OAuth 2.0 Flow

The correct OAuth 2.0 Authorization Code Flow:

```
1. User clicks "Connect to Spotify"
   ↓
2. Frontend → GET /auth/spotify
   ↓
3. Backend validates credentials, generates state, returns authUrl
   ↓
4. Frontend redirects to authUrl (Spotify's login page)
   ↓
5. User logs in and authorizes the app
   ↓
6. Spotify → GET /auth/spotify/callback?code=...&state=...
   ↓
7. Backend validates state, exchanges code for access_token using Client Secret
   ↓
8. Backend stores token in session, redirects to /?spotify=connected
   ↓
9. Frontend detects connection success and updates UI
```

**Security Features:**
- ✅ State parameter prevents CSRF attacks
- ✅ Tokens stored server-side (never exposed to browser)
- ✅ HTTP-only session cookies
- ✅ Automatic token refresh

## Common Issues

### Issue: Still seeing INVALID_CLIENT after fixing credentials
**Solution**: Make sure you restarted the backend server after editing `.env`

### Issue: Redirect URI mismatch
**Solution**: Ensure the redirect URI in Spotify Dashboard matches exactly:
- `.env`: `http://localhost:3000/auth/spotify/callback`
- Spotify Dashboard: Same URL (no trailing slash)

### Issue: Credentials are correct but still not working
**Checklist:**
1. ✅ Client ID is exactly 32 characters
2. ✅ Client Secret is exactly 32 characters
3. ✅ Redirect URI matches in both places
4. ✅ Server has been restarted
5. ✅ No extra spaces or quotes in `.env` file
6. ✅ App is not in "Quota Extension Mode" (should be in Development Mode)

## Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)

## Need Help?

If you're still experiencing issues:
1. Check the server console output for detailed error messages
2. Test the `/health/credentials` endpoint
3. Verify your credentials in Spotify Developer Dashboard
4. Make sure your app is in "Development Mode" (not Quota Extension Mode)
5. Try creating a fresh app in Spotify Dashboard if the issue persists
