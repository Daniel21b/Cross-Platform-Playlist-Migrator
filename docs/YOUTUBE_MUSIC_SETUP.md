# YouTube Music Setup Guide

This project uses **ytmusicapi** (Python library) to interact with YouTube Music, as there is no official YouTube Music API from Google.

## Why ytmusicapi?

- YouTube Music does not have an official API
- ytmusicapi reverse-engineers the YouTube Music web interface
- More reliable than the YouTube Data API for music content
- No OAuth credentials needed (uses browser authentication)

---

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd python-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Authenticate with YouTube Music

Run the authentication setup script:

```bash
python3 auth_setup.py
```

### 3. Choose Authentication Method

#### Option A: Browser Headers (Recommended)

1. Open [YouTube Music](https://music.youtube.com) in your browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the **Network** tab
4. Refresh the page (Cmd+R or Ctrl+R)
5. Find any request to `music.youtube.com`
6. Right-click → Copy → **Copy as cURL**
7. Paste the cURL command when prompted

#### Option B: OAuth (Easier but less reliable)

Simply press Enter when prompted, and a browser window will open for authentication.

### 4. Verify Authentication

The script will test the connection and show:

```
✓ Authentication successful!
✓ Credentials saved to: auth/ytmusic_auth.json
✓ Successfully connected! Found X playlist(s)
```

---

## How It Works

### Architecture

```
Node.js Backend
    ↓
    → Spawns Python child process
    → Python uses ytmusicapi
    → Returns JSON results
    ↓
Node.js processes results
```

### Authentication Flow

1. User runs `auth_setup.py` once
2. Browser credentials saved to `auth/ytmusic_auth.json`
3. Node.js backend spawns Python scripts when needed
4. Python scripts use saved credentials automatically

---

## Troubleshooting

### "Authentication file not found"

**Solution:** Run `python3 auth_setup.py` in the `python-service` directory.

### "Failed to initialize YTMusic"

**Possible causes:**
- Authentication file is corrupted
- YouTube Music changed their API (ytmusicapi needs update)

**Solution:**
1. Delete `auth/ytmusic_auth.json`
2. Run `python3 auth_setup.py` again
3. Update ytmusicapi: `pip install --upgrade ytmusicapi`

### Python not found / Import errors

**Solution:**
```bash
# Ensure virtual environment is activated
cd python-service
source venv/bin/activate  # Windows: venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### "No module named 'ytmusicapi'"

**Solution:**
```bash
cd python-service
source venv/bin/activate
pip install ytmusicapi
```

---

## Security Notes

### Authentication File

The `auth/ytmusic_auth.json` file contains sensitive credentials:
- **Never commit this file to version control** (it's gitignored)
- Treat it like a password
- If compromised, re-authenticate to generate new credentials

### Browser Headers Method

- More secure than storing OAuth tokens
- Headers expire periodically (re-authenticate if issues occur)
- No app approval needed from Google

---

## API Comparison

| Feature | YouTube Data API v3 | ytmusicapi |
|---------|---------------------|------------|
| Official | ✅ Yes | ❌ No (reverse-engineered) |
| Music Focus | ❌ General video | ✅ Music-specific |
| OAuth Required | ✅ Yes | ❌ Browser auth |
| Rate Limits | ✅ 10,000 units/day | ❌ None (but be respectful) |
| Setup Complexity | 🟡 Medium | 🟢 Easy |
| Reliability | 🟢 High | 🟡 Medium (may break with YT updates) |

---

## Maintenance

### Updating ytmusicapi

```bash
cd python-service
source venv/bin/activate
pip install --upgrade ytmusicapi
```

### Re-authenticating

If authentication expires or fails:

```bash
cd python-service
python3 auth_setup.py
```

---

## Development Tips

### Testing Python Service Directly

```bash
cd python-service
source venv/bin/activate

# Get playlists
python3 ytmusic_service.py get_playlists

# Search songs
python3 ytmusic_service.py search "Bohemian Rhapsody"

# Get playlist tracks
python3 ytmusic_service.py get_playlist_tracks <PLAYLIST_ID>
```

### Adding New Features

1. Add method to `ytmusic_service.py`
2. Add command handler in `main()` function
3. Add corresponding method in `youtube.service.js` (Node.js)

---

## Resources

- [ytmusicapi Documentation](https://ytmusicapi.readthedocs.io/)
- [ytmusicapi GitHub](https://github.com/sigma67/ytmusicapi)
- [YouTube Music](https://music.youtube.com)

---

## Support

If you encounter issues:
1. Check this documentation
2. Verify Python environment is set up correctly
3. Try re-authenticating
4. Check ytmusicapi GitHub for known issues
5. Update ytmusicapi to latest version
