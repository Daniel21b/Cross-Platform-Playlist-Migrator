const axios = require('axios');
const spotifyConfig = require('../config/spotify.config');
const SearchUtil = require('../utils/search.util');

class SpotifyService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.apiClient = axios.create({
      baseURL: spotifyConfig.endpoints.api,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getUserProfile() {
    try {
      const response = await this.apiClient.get('/me');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Spotify user profile: ${error.message}`);
    }
  }

  async getUserPlaylists() {
    try {
      const playlists = [];
      let url = '/me/playlists?limit=50';

      while (url) {
        const response = await this.apiClient.get(url);
        playlists.push(...response.data.items);
        url = response.data.next ? response.data.next.replace(spotifyConfig.endpoints.api, '') : null;
      }

      return playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        tracksCount: playlist.tracks.total,
        imageUrl: playlist.images?.[0]?.url,
        public: playlist.public,
        owner: playlist.owner.display_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch Spotify playlists: ${error.message}`);
    }
  }

  async getPlaylistTracks(playlistId) {
    try {
      const tracks = [];
      let url = `/playlists/${playlistId}/tracks?limit=100`;

      while (url) {
        const response = await this.apiClient.get(url);
        
        const validTracks = response.data.items
          .filter(item => item.track && !item.track.is_local)
          .map(item => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map(artist => ({
              id: artist.id,
              name: artist.name
            })),
            album: item.track.album.name,
            duration: item.track.duration_ms,
            uri: item.track.uri,
            isrc: item.track.external_ids?.isrc
          }));

        tracks.push(...validTracks);
        url = response.data.next ? response.data.next.replace(spotifyConfig.endpoints.api, '') : null;
      }

      return tracks;
    } catch (error) {
      throw new Error(`Failed to fetch Spotify playlist tracks: ${error.message}`);
    }
  }

  async searchTrack(query) {
    try {
      const response = await this.apiClient.get('/search', {
        params: {
          q: query,
          type: 'track',
          limit: 10
        }
      });

      return response.data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name,
        artists: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        uri: track.uri
      }));
    } catch (error) {
      throw new Error(`Failed to search Spotify tracks: ${error.message}`);
    }
  }

  async createPlaylist(userId, name, description = '', isPublic = false) {
    try {
      const response = await this.apiClient.post(`/users/${userId}/playlists`, {
        name,
        description,
        public: isPublic
      });

      return {
        id: response.data.id,
        name: response.data.name,
        url: response.data.external_urls.spotify
      };
    } catch (error) {
      throw new Error(`Failed to create Spotify playlist: ${error.message}`);
    }
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    try {
      const batchSize = 100;
      const batches = [];

      for (let i = 0; i < trackUris.length; i += batchSize) {
        batches.push(trackUris.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await this.apiClient.post(`/playlists/${playlistId}/tracks`, {
          uris: batch
        });
      }

      return { added: trackUris.length };
    } catch (error) {
      throw new Error(`Failed to add tracks to Spotify playlist: ${error.message}`);
    }
  }

  async findTrackMatch(sourceTrack) {
    const queries = SearchUtil.buildSearchQuery(sourceTrack);
    
    for (const query of queries) {
      const results = await this.searchTrack(query);
      
      if (results.length > 0) {
        const bestMatch = SearchUtil.findBestMatch(sourceTrack, results);
        if (bestMatch) {
          return bestMatch;
        }
      }
    }
    
    return null;
  }
}

module.exports = SpotifyService;
