#!/usr/bin/env python3
"""
YouTube Music Service
Provides YouTube Music API operations using ytmusicapi
Called by Node.js backend as child process
"""

import sys
import json
import os
from pathlib import Path
from ytmusicapi import YTMusic

AUTH_FILE = Path(__file__).parent / 'auth' / 'ytmusic_auth.json'

def load_ytmusic():
    """Initialize YTMusic client with authentication"""
    if not AUTH_FILE.exists():
        return None, {"error": "Authentication file not found. Run auth_setup.py first."}
    
    try:
        ytmusic = YTMusic(str(AUTH_FILE))
        return ytmusic, None
    except Exception as e:
        return None, {"error": f"Failed to initialize YTMusic: {str(e)}"}

def get_library_playlists():
    """Get user's library playlists"""
    ytmusic, error = load_ytmusic()
    if error:
        return error
    
    try:
        playlists = ytmusic.get_library_playlists(limit=None)
        
        formatted = []
        for playlist in playlists:
            formatted.append({
                "id": playlist.get("playlistId"),
                "name": playlist.get("title", "Untitled"),
                "description": playlist.get("description", ""),
                "tracksCount": playlist.get("count", 0),
                "imageUrl": playlist.get("thumbnails", [{}])[0].get("url") if playlist.get("thumbnails") else None
            })
        
        return {"success": True, "playlists": formatted}
    except Exception as e:
        return {"error": f"Failed to fetch playlists: {str(e)}"}

def get_playlist_tracks(playlist_id):
    """Get tracks from a specific playlist"""
    ytmusic, error = load_ytmusic()
    if error:
        return error
    
    try:
        playlist = ytmusic.get_playlist(playlist_id, limit=None)
        tracks = playlist.get("tracks", [])
        
        formatted = []
        for track in tracks:
            if track.get("videoId"):
                formatted.append({
                    "id": track.get("videoId"),
                    "title": track.get("title", "Unknown"),
                    "name": track.get("title", "Unknown"),
                    "artists": [{"name": artist.get("name")} for artist in track.get("artists", [])],
                    "artist": track.get("artists", [{}])[0].get("name", "Unknown") if track.get("artists") else "Unknown",
                    "album": track.get("album", {}).get("name", "Unknown") if track.get("album") else "Unknown",
                    "duration": track.get("duration_seconds", 0),
                    "thumbnail": track.get("thumbnails", [{}])[0].get("url") if track.get("thumbnails") else None
                })
        
        return {"success": True, "tracks": formatted}
    except Exception as e:
        return {"error": f"Failed to fetch playlist tracks: {str(e)}"}

def search_songs(query):
    """Search for songs on YouTube Music"""
    ytmusic, error = load_ytmusic()
    if error:
        return error
    
    try:
        results = ytmusic.search(query, filter="songs", limit=10)
        
        formatted = []
        for item in results:
            if item.get("videoId"):
                formatted.append({
                    "id": item.get("videoId"),
                    "title": item.get("title", "Unknown"),
                    "name": item.get("title", "Unknown"),
                    "artist": item.get("artists", [{}])[0].get("name", "Unknown") if item.get("artists") else "Unknown",
                    "artists": ", ".join([a.get("name", "") for a in item.get("artists", [])]),
                    "album": item.get("album", {}).get("name", "") if item.get("album") else "",
                    "duration": item.get("duration_seconds", 0)
                })
        
        return {"success": True, "results": formatted}
    except Exception as e:
        return {"error": f"Failed to search songs: {str(e)}"}

def create_playlist(name, description="", privacy_status="PRIVATE"):
    """Create a new playlist"""
    ytmusic, error = load_ytmusic()
    if error:
        return error
    
    try:
        playlist_id = ytmusic.create_playlist(
            title=name,
            description=description,
            privacy_status=privacy_status
        )
        
        return {
            "success": True,
            "playlist": {
                "id": playlist_id,
                "name": name,
                "url": f"https://music.youtube.com/playlist?list={playlist_id}"
            }
        }
    except Exception as e:
        return {"error": f"Failed to create playlist: {str(e)}"}

def add_tracks_to_playlist(playlist_id, video_ids):
    """Add tracks to a playlist"""
    ytmusic, error = load_ytmusic()
    if error:
        return error
    
    try:
        status = ytmusic.add_playlist_items(playlist_id, video_ids)
        
        return {
            "success": True,
            "added": len(video_ids),
            "status": status
        }
    except Exception as e:
        return {"error": f"Failed to add tracks to playlist: {str(e)}"}

def main():
    """Main entry point for command-line usage"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == "get_playlists":
            result = get_library_playlists()
        
        elif command == "get_playlist_tracks":
            if len(sys.argv) < 3:
                result = {"error": "Playlist ID required"}
            else:
                result = get_playlist_tracks(sys.argv[2])
        
        elif command == "search":
            if len(sys.argv) < 3:
                result = {"error": "Search query required"}
            else:
                result = search_songs(sys.argv[2])
        
        elif command == "create_playlist":
            if len(sys.argv) < 3:
                result = {"error": "Playlist name required"}
            else:
                name = sys.argv[2]
                description = sys.argv[3] if len(sys.argv) > 3 else ""
                privacy = sys.argv[4] if len(sys.argv) > 4 else "PRIVATE"
                result = create_playlist(name, description, privacy)
        
        elif command == "add_tracks":
            if len(sys.argv) < 4:
                result = {"error": "Playlist ID and video IDs required"}
            else:
                playlist_id = sys.argv[2]
                video_ids = json.loads(sys.argv[3])
                result = add_tracks_to_playlist(playlist_id, video_ids)
        
        else:
            result = {"error": f"Unknown command: {command}"}
        
        print(json.dumps(result))
    
    except Exception as e:
        print(json.dumps({"error": f"Execution error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
