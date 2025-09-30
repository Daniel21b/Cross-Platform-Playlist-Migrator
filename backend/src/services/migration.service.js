const SpotifyService = require('./spotify.service');
const YouTubeMusicService = require('./youtube.service');
const TokenManager = require('../utils/token.util');

class MigrationService {
  constructor() {
    this.activeMigrations = new Map();
  }

  async migratePlaylist(session, migrationRequest) {
    const { source, destination, playlistId, playlistName } = migrationRequest;
    const migrationId = this.generateMigrationId();

    const migrationState = {
      id: migrationId,
      status: 'in_progress',
      source,
      destination,
      sourcePlaylistId: playlistId,
      sourcePlaylistName: playlistName,
      progress: {
        total: 0,
        processed: 0,
        matched: 0,
        failed: 0
      },
      tracks: [],
      startTime: Date.now(),
      endTime: null,
      error: null
    };

    this.activeMigrations.set(migrationId, migrationState);

    this.performMigration(session, migrationState).catch(error => {
      migrationState.status = 'failed';
      migrationState.error = error.message;
      migrationState.endTime = Date.now();
    });

    return { migrationId, status: 'started' };
  }

  async performMigration(session, state) {
    try {
      const sourceToken = await TokenManager.ensureValidToken(session, state.source);
      const destToken = await TokenManager.ensureValidToken(session, state.destination);

      const sourceService = this.getService(state.source, sourceToken);
      const destService = this.getService(state.destination, destToken);

      state.progress.total = await this.getTrackCount(sourceService, state.sourcePlaylistId);

      const sourceTracks = await this.getSourceTracks(sourceService, state.sourcePlaylistId);
      state.progress.total = sourceTracks.length;

      const newPlaylist = await this.createDestinationPlaylist(
        destService,
        session,
        state.destination,
        state.sourcePlaylistName
      );
      state.destinationPlaylistId = newPlaylist.id;
      state.destinationPlaylistUrl = newPlaylist.url;

      const matchedItems = [];

      for (const track of sourceTracks) {
        try {
          const match = await destService.findTrackMatch(track);
          
          const trackResult = {
            original: {
              name: track.name,
              artist: track.artists?.[0]?.name || track.artist || 'Unknown'
            },
            matched: match ? {
              name: match.name || match.title,
              artist: match.artist || match.channel || 'Unknown',
              id: match.id
            } : null,
            status: match ? 'matched' : 'failed'
          };

          state.tracks.push(trackResult);
          
          if (match) {
            matchedItems.push(match);
            state.progress.matched++;
          } else {
            state.progress.failed++;
          }

          state.progress.processed++;
        } catch (error) {
          state.tracks.push({
            original: {
              name: track.name,
              artist: track.artists?.[0]?.name || 'Unknown'
            },
            matched: null,
            status: 'error',
            error: error.message
          });
          state.progress.failed++;
          state.progress.processed++;
        }
      }

      if (matchedItems.length > 0) {
        await this.addTracksToDestination(
          destService,
          state.destination,
          newPlaylist.id,
          matchedItems
        );
      }

      state.status = 'completed';
      state.endTime = Date.now();
    } catch (error) {
      state.status = 'failed';
      state.error = error.message;
      state.endTime = Date.now();
      throw error;
    }
  }

  getService(platform, accessToken) {
    if (platform === 'spotify') {
      return new SpotifyService(accessToken);
    } else if (platform === 'youtubeMusic') {
      return new YouTubeMusicService();
    }
    throw new Error(`Unsupported platform: ${platform}`);
  }

  async getTrackCount(service, playlistId) {
    if (service instanceof SpotifyService) {
      const tracks = await service.getPlaylistTracks(playlistId);
      return tracks.length;
    } else if (service instanceof YouTubeMusicService) {
      const videos = await service.getPlaylistVideos(playlistId);
      return videos.length;
    }
    return 0;
  }

  async getSourceTracks(service, playlistId) {
    if (service instanceof SpotifyService) {
      return await service.getPlaylistTracks(playlistId);
    } else if (service instanceof YouTubeMusicService) {
      return await service.getPlaylistVideos(playlistId);
    }
    throw new Error('Unsupported service type');
  }

  async createDestinationPlaylist(service, session, platform, sourceName) {
    const newPlaylistName = `${sourceName} (Migrated)`;
    
    if (service instanceof SpotifyService) {
      const profile = await service.getUserProfile();
      return await service.createPlaylist(
        profile.id,
        newPlaylistName,
        'Migrated from another platform',
        false
      );
    } else if (service instanceof YouTubeMusicService) {
      return await service.createPlaylist(
        newPlaylistName,
        'Migrated from another platform',
        'PRIVATE'
      );
    }
    throw new Error('Unsupported service type');
  }

  async addTracksToDestination(service, platform, playlistId, items) {
    if (service instanceof SpotifyService) {
      const uris = items.map(item => item.uri);
      return await service.addTracksToPlaylist(playlistId, uris);
    } else if (service instanceof YouTubeMusicService) {
      const videoIds = items.map(item => item.id);
      return await service.addVideosToPlaylist(playlistId, videoIds);
    }
    throw new Error('Unsupported service type');
  }

  getMigrationStatus(migrationId) {
    const migration = this.activeMigrations.get(migrationId);
    
    if (!migration) {
      return null;
    }

    return {
      id: migration.id,
      status: migration.status,
      progress: migration.progress,
      tracks: migration.tracks,
      destinationPlaylistId: migration.destinationPlaylistId,
      destinationPlaylistUrl: migration.destinationPlaylistUrl,
      error: migration.error,
      duration: migration.endTime 
        ? migration.endTime - migration.startTime 
        : Date.now() - migration.startTime
    };
  }

  generateMigrationId() {
    return `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  cleanupOldMigrations(maxAge = 3600000) {
    const now = Date.now();
    for (const [id, migration] of this.activeMigrations.entries()) {
      if (migration.endTime && (now - migration.endTime) > maxAge) {
        this.activeMigrations.delete(id);
      }
    }
  }
}

module.exports = new MigrationService();
