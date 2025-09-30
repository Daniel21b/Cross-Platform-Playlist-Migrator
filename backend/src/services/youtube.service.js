const { spawn } = require('child_process');
const path = require('path');
const SearchUtil = require('../utils/search.util');

class YouTubeMusicService {
  constructor() {
    this.pythonPath = this.findPythonPath();
    this.servicePath = path.join(__dirname, '../../../python-service/ytmusic_service.py');
  }

  findPythonPath() {
    const venvPath = path.join(__dirname, '../../../python-service/venv/bin/python3');
    const fs = require('fs');
    
    if (fs.existsSync(venvPath)) {
      return venvPath;
    }
    
    return 'python3';
  }

  async executePythonCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const pythonArgs = [this.servicePath, command, ...args];
      const pythonProcess = spawn(this.pythonPath, pythonArgs);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}\nOutput: ${stdout}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  async getUserPlaylists() {
    try {
      const result = await this.executePythonCommand('get_playlists');
      return result.playlists || [];
    } catch (error) {
      throw new Error(`Failed to fetch YouTube Music playlists: ${error.message}`);
    }
  }

  async getPlaylistVideos(playlistId) {
    try {
      const result = await this.executePythonCommand('get_playlist_tracks', [playlistId]);
      return result.tracks || [];
    } catch (error) {
      throw new Error(`Failed to fetch YouTube Music playlist tracks: ${error.message}`);
    }
  }

  async searchVideo(query) {
    try {
      const result = await this.executePythonCommand('search', [query]);
      return result.results || [];
    } catch (error) {
      throw new Error(`Failed to search YouTube Music: ${error.message}`);
    }
  }

  async createPlaylist(title, description = '', privacyStatus = 'PRIVATE') {
    try {
      const result = await this.executePythonCommand('create_playlist', [
        title,
        description,
        privacyStatus
      ]);
      
      return result.playlist;
    } catch (error) {
      throw new Error(`Failed to create YouTube Music playlist: ${error.message}`);
    }
  }

  async addVideoToPlaylist(playlistId, videoId) {
    try {
      await this.executePythonCommand('add_tracks', [
        playlistId,
        JSON.stringify([videoId])
      ]);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to add track to YouTube Music playlist: ${error.message}`);
    }
  }

  async addVideosToPlaylist(playlistId, videoIds) {
    const results = {
      added: 0,
      failed: 0,
      errors: []
    };

    const batchSize = 20;
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      
      try {
        await this.executePythonCommand('add_tracks', [
          playlistId,
          JSON.stringify(batch)
        ]);
        results.added += batch.length;
        
        await this.delay(500);
      } catch (error) {
        results.failed += batch.length;
        results.errors.push({
          batch: batch,
          error: error.message
        });
      }
    }

    return results;
  }

  async findVideoMatch(sourceTrack) {
    const queries = SearchUtil.buildSearchQuery(sourceTrack);
    
    for (const query of queries) {
      const results = await this.searchVideo(query);
      
      if (results.length > 0) {
        const bestMatch = SearchUtil.findBestMatch(sourceTrack, results);
        if (bestMatch) {
          return bestMatch;
        }
      }
    }
    
    return null;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = YouTubeMusicService;