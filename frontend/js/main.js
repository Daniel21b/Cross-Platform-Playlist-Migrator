const App = {
  state: {
    spotifyConnected: false,
    youtubeMusicConnected: false,
    playlists: [],
    selectedPlaylist: null,
    migrationId: null,
    pollInterval: null
  },

  elements: {},

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.initializeAccordion();
    this.checkAuthStatus();
    this.handleAuthCallback();
  },

  cacheElements() {
    this.elements = {
      spotifyStatus: document.getElementById('spotify-status'),
      spotifyConnect: document.getElementById('spotify-connect'),
      youtubeStatus: document.getElementById('youtube-status'),
      youtubeConnect: document.getElementById('youtube-connect'),
      
      migrationSection: document.getElementById('migration-section'),
      sourcePlatform: document.getElementById('source-platform'),
      playlistSelection: document.getElementById('playlist-selection'),
      playlistSelect: document.getElementById('playlist-select'),
      destinationSelection: document.getElementById('destination-selection'),
      destinationPlatform: document.getElementById('destination-platform'),
      migrateBtn: document.getElementById('migrate-btn'),
      
      progressSection: document.getElementById('progress-section'),
      migrationStatus: document.getElementById('migration-status'),
      migrationProgress: document.getElementById('migration-progress'),
      migrationMatched: document.getElementById('migration-matched'),
      migrationFailed: document.getElementById('migration-failed'),
      progressBar: document.getElementById('progress-bar'),
      trackList: document.getElementById('track-list'),
      migrationComplete: document.getElementById('migration-complete'),
      completionMessage: document.getElementById('completion-message'),
      playlistLink: document.getElementById('playlist-link'),
      newMigrationBtn: document.getElementById('new-migration-btn')
    };
  },

  attachEventListeners() {
    this.elements.spotifyConnect.addEventListener('click', () => this.connectPlatform('spotify'));
    this.elements.youtubeConnect.addEventListener('click', () => this.connectPlatform('youtubeMusic'));
    this.elements.sourcePlatform.addEventListener('change', (e) => this.handleSourceChange(e));
    this.elements.playlistSelect.addEventListener('change', (e) => this.handlePlaylistChange(e));
    this.elements.destinationPlatform.addEventListener('change', (e) => this.handleDestinationChange(e));
    this.elements.migrateBtn.addEventListener('click', () => this.startMigration());
    this.elements.newMigrationBtn.addEventListener('click', () => this.resetApp());
  },

  initializeAccordion() {
    const mainToggle = document.getElementById('how-it-works-toggle');
    const mainContent = document.getElementById('how-it-works-content');
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    if (mainToggle && mainContent) {
      mainToggle.addEventListener('click', () => {
        mainToggle.classList.toggle('active');
        mainContent.classList.toggle('hidden');
      });
    }

    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');

        header.classList.toggle('active');
        content.classList.toggle('active');
      });
    });
  },

  async checkAuthStatus() {
    try {
      const response = await API.getAuthStatus();
      this.state.spotifyConnected = response.authenticated.spotify;
      this.state.youtubeMusicConnected = response.authenticated.youtubeMusic;
      this.updateAuthUI();
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  },

  handleAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('spotify') && params.get('spotify') === 'connected') {
      this.state.spotifyConnected = true;
      this.updateAuthUI();
      window.history.replaceState({}, '', '/');
    }
    
    if (params.has('youtubeMusic') && params.get('youtubeMusic') === 'connected') {
      this.state.youtubeMusicConnected = true;
      this.updateAuthUI();
      window.history.replaceState({}, '', '/');
    }

    if (params.has('error')) {
      const reason = params.get('reason') || 'Unknown error';
      const details = params.get('details');
      
      let errorMessage = `❌ Authentication Failed\n\nError: ${reason}`;
      
      if (details) {
        errorMessage += `\n\nDetails: ${details}`;
      }
      
      if (reason === 'invalid_client' || reason.toLowerCase().includes('client')) {
        errorMessage += '\n\n🔧 This usually means:\n' +
          '• Your Spotify Client ID or Client Secret is incorrect\n' +
          '• The credentials are incomplete (must be 32 characters each)\n' +
          '• The Redirect URI doesn\'t match in Spotify Developer Dashboard\n\n' +
          'Check the server console for detailed validation errors.';
      }
      
      alert(errorMessage);
      window.history.replaceState({}, '', '/');
    }
  },

  updateAuthUI() {
    if (this.state.spotifyConnected) {
      this.elements.spotifyStatus.classList.remove('disconnected');
      this.elements.spotifyStatus.classList.add('connected');
      this.elements.spotifyStatus.querySelector('.status-text').textContent = 'Connected';
      this.elements.spotifyConnect.textContent = 'Connected';
      this.elements.spotifyConnect.disabled = true;
    }

    if (this.state.youtubeMusicConnected) {
      this.elements.youtubeStatus.classList.remove('disconnected');
      this.elements.youtubeStatus.classList.add('connected');
      this.elements.youtubeStatus.querySelector('.status-text').textContent = 'Connected';
      this.elements.youtubeConnect.textContent = 'Connected';
      this.elements.youtubeConnect.disabled = true;
    }

    if (this.state.spotifyConnected && this.state.youtubeMusicConnected) {
      this.elements.migrationSection.classList.remove('hidden');
    }
  },

  async connectPlatform(platform) {
    try {
      const button = platform === 'spotify' ? this.elements.spotifyConnect : this.elements.youtubeConnect;
      button.disabled = true;
      button.textContent = 'Connecting...';

      const response = platform === 'spotify' 
        ? await API.initiateSpotifyAuth()
        : await API.initiateYouTubeMusicAuth();

      if (response.authUrl) {
        window.location.href = response.authUrl;
      } else if (response.setupRequired) {
        button.disabled = false;
        button.textContent = `Connect to ${platform === 'spotify' ? 'Spotify' : 'YouTube Music'}`;
        
        const instructions = response.instructions.join('\n');
        alert(`YouTube Music Setup Required:\n\n${response.message}\n\nSteps:\n${instructions}\n\nAfter setup, refresh this page.`);
      } else if (response.authenticated) {
        this.state.youtubeMusicConnected = true;
        this.updateAuthUI();
      }
    } catch (error) {
      const button = platform === 'spotify' ? this.elements.spotifyConnect : this.elements.youtubeConnect;
      button.disabled = false;
      button.textContent = `Connect to ${platform === 'spotify' ? 'Spotify' : 'YouTube Music'}`;
      
      if (error.message && error.message.includes('not properly configured')) {
        this.showConfigurationError(platform);
      } else {
        alert(`Failed to connect to ${platform}: ${error.message}`);
      }
    }
  },

  showConfigurationError(platform) {
    const message = `⚠️ ${platform === 'spotify' ? 'Spotify' : 'YouTube Music'} Configuration Error\n\n` +
      `The server is not properly configured for ${platform} authentication.\n\n` +
      `To fix this:\n` +
      `1. Go to https://developer.spotify.com/dashboard\n` +
      `2. Select your app and click "Settings"\n` +
      `3. Copy your Client ID (must be exactly 32 characters)\n` +
      `4. Copy your Client Secret (must be exactly 32 characters)\n` +
      `5. Update the backend/.env file with correct values\n` +
      `6. Ensure Redirect URI is: http://localhost:3000/auth/spotify/callback\n` +
      `7. Restart the backend server\n\n` +
      `Check the server console for detailed error messages.`;
    
    alert(message);
  },

  async handleSourceChange(e) {
    const platform = e.target.value;
    
    if (!platform) {
      this.elements.playlistSelection.classList.add('hidden');
      this.elements.destinationSelection.classList.add('hidden');
      this.elements.migrateBtn.classList.add('hidden');
      return;
    }

    this.elements.playlistSelect.innerHTML = '<option value="">Loading playlists...</option>';
    this.elements.playlistSelection.classList.remove('hidden');

    try {
      const response = await API.getPlaylists(platform);
      this.state.playlists = response.playlists;
      
      this.elements.playlistSelect.innerHTML = '<option value="">Select a playlist...</option>';
      response.playlists.forEach(playlist => {
        const option = document.createElement('option');
        option.value = playlist.id;
        option.textContent = `${playlist.name} (${playlist.tracksCount} tracks)`;
        option.dataset.name = playlist.name;
        this.elements.playlistSelect.appendChild(option);
      });

      this.updateDestinationOptions(platform);
    } catch (error) {
      alert(`Failed to load playlists: ${error.message}`);
      this.elements.playlistSelect.innerHTML = '<option value="">Error loading playlists</option>';
    }
  },

  handlePlaylistChange(e) {
    const playlistId = e.target.value;
    
    if (!playlistId) {
      this.elements.migrateBtn.classList.add('hidden');
      return;
    }

    const selectedOption = e.target.options[e.target.selectedIndex];
    this.state.selectedPlaylist = {
      id: playlistId,
      name: selectedOption.dataset.name
    };

    this.elements.destinationSelection.classList.remove('hidden');
  },

  updateDestinationOptions(sourcePlatform) {
    this.elements.destinationPlatform.innerHTML = '<option value="">Select destination...</option>';
    
    if (sourcePlatform === 'spotify' && this.state.youtubeMusicConnected) {
      const option = document.createElement('option');
      option.value = 'youtubeMusic';
      option.textContent = 'YouTube Music';
      this.elements.destinationPlatform.appendChild(option);
    }
    
    if (sourcePlatform === 'youtubeMusic' && this.state.spotifyConnected) {
      const option = document.createElement('option');
      option.value = 'spotify';
      option.textContent = 'Spotify';
      this.elements.destinationPlatform.appendChild(option);
    }
  },

  handleDestinationChange(e) {
    const destination = e.target.value;
    
    if (destination && this.state.selectedPlaylist) {
      this.elements.migrateBtn.classList.remove('hidden');
      this.elements.migrateBtn.disabled = false;
    } else {
      this.elements.migrateBtn.classList.add('hidden');
    }
  },

  async startMigration() {
    const sourcePlatform = this.elements.sourcePlatform.value;
    const destinationPlatform = this.elements.destinationPlatform.value;
    
    if (!sourcePlatform || !destinationPlatform || !this.state.selectedPlaylist) {
      alert('Please select source, destination, and playlist');
      return;
    }

    this.elements.migrateBtn.disabled = true;
    this.elements.migrateBtn.textContent = 'Starting Migration...';

    try {
      const response = await API.startMigration({
        source: sourcePlatform,
        destination: destinationPlatform,
        playlistId: this.state.selectedPlaylist.id,
        playlistName: this.state.selectedPlaylist.name
      });

      this.state.migrationId = response.migrationId;
      
      this.elements.migrationSection.classList.add('hidden');
      this.elements.progressSection.classList.remove('hidden');
      
      this.startPollingMigrationStatus();
    } catch (error) {
      alert(`Failed to start migration: ${error.message}`);
      this.elements.migrateBtn.disabled = false;
      this.elements.migrateBtn.textContent = 'Start Migration';
    }
  },

  startPollingMigrationStatus() {
    this.state.pollInterval = setInterval(() => {
      this.checkMigrationStatus();
    }, 2000);
    
    this.checkMigrationStatus();
  },

  async checkMigrationStatus() {
    try {
      const response = await API.getMigrationStatus(this.state.migrationId);
      this.updateProgressUI(response.migration);

      if (response.migration.status === 'completed' || response.migration.status === 'failed') {
        clearInterval(this.state.pollInterval);
        this.showCompletion(response.migration);
      }
    } catch (error) {
      console.error('Failed to check migration status:', error);
    }
  },

  updateProgressUI(migration) {
    this.elements.migrationStatus.textContent = migration.status.replace('_', ' ').toUpperCase();
    this.elements.migrationProgress.textContent = `${migration.progress.processed}/${migration.progress.total}`;
    this.elements.migrationMatched.textContent = migration.progress.matched;
    this.elements.migrationFailed.textContent = migration.progress.failed;

    const percentage = migration.progress.total > 0 
      ? (migration.progress.processed / migration.progress.total) * 100 
      : 0;
    this.elements.progressBar.style.width = `${percentage}%`;

    this.elements.trackList.innerHTML = '';
    migration.tracks.forEach(track => {
      const trackItem = document.createElement('div');
      trackItem.className = 'track-item';
      
      trackItem.innerHTML = `
        <div class="track-info">
          <div class="track-name">${track.original.name}</div>
          <div class="track-artist">${track.original.artist}</div>
        </div>
        <span class="track-status ${track.status}">${track.status}</span>
      `;
      
      this.elements.trackList.appendChild(trackItem);
    });

    this.elements.trackList.scrollTop = this.elements.trackList.scrollHeight;
  },

  showCompletion(migration) {
    this.elements.migrationComplete.classList.remove('hidden');
    
    if (migration.status === 'completed') {
      const matched = migration.progress.matched;
      const total = migration.progress.total;
      const duration = Math.round(migration.duration / 1000);
      
      this.elements.completionMessage.textContent = 
        `Successfully migrated ${matched} out of ${total} tracks in ${duration} seconds.`;

      if (migration.destinationPlaylistUrl) {
        this.elements.playlistLink.href = migration.destinationPlaylistUrl;
        this.elements.playlistLink.classList.remove('hidden');
      }
    } else {
      this.elements.completionMessage.textContent = 
        `Migration failed: ${migration.error || 'Unknown error'}`;
      this.elements.playlistLink.classList.add('hidden');
    }
  },

  resetApp() {
    this.state.selectedPlaylist = null;
    this.state.migrationId = null;
    
    this.elements.progressSection.classList.add('hidden');
    this.elements.migrationSection.classList.remove('hidden');
    this.elements.migrationComplete.classList.add('hidden');
    
    this.elements.sourcePlatform.value = '';
    this.elements.playlistSelect.value = '';
    this.elements.destinationPlatform.value = '';
    this.elements.playlistSelection.classList.add('hidden');
    this.elements.destinationSelection.classList.add('hidden');
    this.elements.migrateBtn.classList.add('hidden');
    this.elements.migrateBtn.disabled = true;
    this.elements.migrateBtn.textContent = 'Start Migration';
    this.elements.trackList.innerHTML = '';
    this.elements.progressBar.style.width = '0%';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
