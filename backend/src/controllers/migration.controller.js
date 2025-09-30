const SpotifyService = require('../services/spotify.service');
const YouTubeMusicService = require('../services/youtube.service');
const migrationService = require('../services/migration.service');
const TokenManager = require('../utils/token.util');

class MigrationController {
  async getPlaylists(req, res) {
    try {
      const { platform } = req.params;

      const accessToken = await TokenManager.ensureValidToken(req.session, platform);

      let playlists;
      if (platform === 'spotify') {
        const service = new SpotifyService(accessToken);
        playlists = await service.getUserPlaylists();
      } else if (platform === 'youtubeMusic') {
        const service = new YouTubeMusicService();
        playlists = await service.getUserPlaylists();
      } else {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid platform. Use "spotify" or "youtubeMusic"' }
        });
      }

      res.json({
        success: true,
        platform,
        playlists
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  async getPlaylistTracks(req, res) {
    try {
      const { platform, id } = req.params;

      const accessToken = await TokenManager.ensureValidToken(req.session, platform);

      let tracks;
      if (platform === 'spotify') {
        const service = new SpotifyService(accessToken);
        tracks = await service.getPlaylistTracks(id);
      } else if (platform === 'youtubeMusic') {
        const service = new YouTubeMusicService();
        tracks = await service.getPlaylistVideos(id);
      } else {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid platform. Use "spotify" or "youtubeMusic"' }
        });
      }

      res.json({
        success: true,
        platform,
        playlistId: id,
        tracks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  async startMigration(req, res) {
    try {
      const { source, destination, playlistId, playlistName } = req.body;

      if (!playlistId || !playlistName) {
        return res.status(400).json({
          success: false,
          error: { message: 'playlistId and playlistName are required' }
        });
      }

      const result = await migrationService.migratePlaylist(req.session, {
        source,
        destination,
        playlistId,
        playlistName
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  getMigrationStatus(req, res) {
    const { migrationId } = req.params;

    const status = migrationService.getMigrationStatus(migrationId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: { message: 'Migration not found' }
      });
    }

    res.json({
      success: true,
      migration: status
    });
  }
}

module.exports = new MigrationController();
