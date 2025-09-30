# Python YouTube Music Service

This service integrates the `ytmusicapi` library with the Node.js backend to provide YouTube Music functionality.

## Setup

### 1. Create Virtual Environment

```bash
cd python-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Authenticate with YouTube Music

Run the authentication setup script:

```bash
python auth_setup.py
```

This will guide you through the browser-based authentication process and create `auth/ytmusic_auth.json`.

## How It Works

- Node.js backend spawns Python scripts as child processes
- Python scripts use ytmusicapi to interact with YouTube Music
- Results are returned as JSON to Node.js
- Authentication is handled via browser headers (more reliable than OAuth for YouTube Music)

## Scripts

- `auth_setup.py` - Initial authentication setup
- `ytmusic_service.py` - Main service for playlist and track operations
- `auth/ytmusic_auth.json` - Stored authentication credentials (gitignored)

## Usage

The Node.js backend automatically calls these scripts. No manual intervention needed during normal operation.
