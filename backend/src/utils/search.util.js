class SearchUtil {
  static normalizeString(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  static extractArtistAndTitle(track) {
    if (track.artist && track.title) {
      return {
        artist: this.normalizeString(track.artist),
        title: this.normalizeString(track.title)
      };
    }
    
    const fullName = track.name || track.title || '';
    const parts = fullName.split('-').map(p => p.trim());
    
    if (parts.length >= 2) {
      return {
        artist: this.normalizeString(parts[0]),
        title: this.normalizeString(parts.slice(1).join(' '))
      };
    }
    
    return {
      artist: '',
      title: this.normalizeString(fullName)
    };
  }

  static buildSearchQuery(track) {
    const queries = [];
    
    const artistName = Array.isArray(track.artists) 
      ? track.artists[0]?.name || ''
      : track.artist || '';
    const trackTitle = track.name || track.title || '';
    
    if (artistName && trackTitle) {
      queries.push(`${artistName} ${trackTitle}`);
      queries.push(trackTitle);
    } else if (trackTitle) {
      queries.push(trackTitle);
    }
    
    return queries;
  }

  static calculateMatchScore(searchTrack, resultTrack) {
    const search = this.extractArtistAndTitle(searchTrack);
    const result = this.extractArtistAndTitle(resultTrack);
    
    let score = 0;
    
    if (result.title.includes(search.title) || search.title.includes(result.title)) {
      score += 50;
    }
    
    if (search.title === result.title) {
      score += 30;
    }
    
    if (search.artist && result.artist) {
      if (result.artist.includes(search.artist) || search.artist.includes(result.artist)) {
        score += 20;
      }
    }
    
    return score;
  }

  static findBestMatch(searchTrack, results) {
    if (!results || results.length === 0) {
      return null;
    }

    let bestMatch = null;
    let highestScore = 0;

    for (const result of results) {
      const score = this.calculateMatchScore(searchTrack, result);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = result;
      }
    }

    return highestScore >= 50 ? bestMatch : results[0];
  }

  static removeExtraInfo(title) {
    return title
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/\s*\[.*?\]\s*/g, '')
      .replace(/\s*-\s*(official|audio|video|lyrics|hd|hq|remix|remaster).*$/i, '')
      .trim();
  }
}

module.exports = SearchUtil;
