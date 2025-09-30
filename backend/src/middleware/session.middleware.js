const requireAuth = (platform) => {
  return (req, res, next) => {
    if (!req.session[`${platform}Token`]) {
      return res.status(401).json({
        success: false,
        error: {
          message: `Not authenticated with ${platform}. Please authenticate first.`,
          code: 'AUTH_REQUIRED',
          platform
        }
      });
    }
    next();
  };
};

const requireBothPlatforms = (req, res, next) => {
  const { source, destination } = req.body;

  if (!source || !destination) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Both source and destination platforms are required'
      }
    });
  }

  if (!req.session[`${source}Token`]) {
    return res.status(401).json({
      success: false,
      error: {
        message: `Not authenticated with ${source}`,
        code: 'AUTH_REQUIRED',
        platform: source
      }
    });
  }

  if (!req.session[`${destination}Token`]) {
    return res.status(401).json({
      success: false,
      error: {
        message: `Not authenticated with ${destination}`,
        code: 'AUTH_REQUIRED',
        platform: destination
      }
    });
  }

  next();
};

module.exports = {
  requireAuth,
  requireBothPlatforms
};
