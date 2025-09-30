#!/usr/bin/env python3
"""
YouTube Music Authentication Setup
Guides user through browser-based authentication
"""

import os
from pathlib import Path
from ytmusicapi import YTMusic

AUTH_FILE = Path(__file__).parent / 'auth' / 'ytmusic_auth.json'

def setup_auth():
    """
    Set up YouTube Music authentication using browser headers
    This is the recommended method for ytmusicapi
    """
    print("=" * 60)
    print("YouTube Music Authentication Setup")
    print("=" * 60)
    print()
    print("This will guide you through authenticating with YouTube Music.")
    print()
    print("STEPS:")
    print("1. Open YouTube Music in your browser (https://music.youtube.com)")
    print("2. Open Developer Tools (F12 or Cmd+Option+I)")
    print("3. Go to Network tab")
    print("4. Refresh the page")
    print("5. Find any request to 'music.youtube.com' ")
    print("6. Right-click → Copy → Copy as cURL")
    print()
    print("Paste the cURL command below (or press Enter to use OAuth):")
    print()
    
    # Create auth directory if it doesn't exist
    AUTH_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # Try browser-based authentication first
        headers_raw = input().strip()
        
        if headers_raw:
            # Parse headers from cURL or use setup_oauth
            ytmusic = YTMusic.setup(filepath=str(AUTH_FILE), headers_raw=headers_raw)
            print()
            print("✓ Authentication successful!")
            print(f"✓ Credentials saved to: {AUTH_FILE}")
        else:
            # Use OAuth authentication
            print()
            print("Using OAuth authentication...")
            print("A browser window will open for authentication.")
            print()
            YTMusic.setup_oauth(filepath=str(AUTH_FILE))
            print()
            print("✓ OAuth authentication successful!")
            print(f"✓ Credentials saved to: {AUTH_FILE}")
        
        # Test the authentication
        print()
        print("Testing authentication...")
        ytmusic = YTMusic(str(AUTH_FILE))
        playlists = ytmusic.get_library_playlists(limit=1)
        print(f"✓ Successfully connected! Found {len(playlists)} playlist(s)")
        print()
        print("=" * 60)
        print("Setup complete! You can now use YouTube Music features.")
        print("=" * 60)
        
        return True
    
    except Exception as e:
        print()
        print(f"✗ Error during authentication: {str(e)}")
        print()
        print("Please try again or check the documentation.")
        return False

if __name__ == "__main__":
    setup_auth()
