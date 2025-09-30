const express = require('express');
const migrationController = require('../controllers/migration.controller');
const { requireAuth, requireBothPlatforms } = require('../middleware/session.middleware');

const router = express.Router();

router.get(
  '/playlists/:platform',
  (req, res, next) => requireAuth(req.params.platform)(req, res, next),
  migrationController.getPlaylists.bind(migrationController)
);

router.get(
  '/playlist/:platform/:id/tracks',
  (req, res, next) => requireAuth(req.params.platform)(req, res, next),
  migrationController.getPlaylistTracks.bind(migrationController)
);

router.post(
  '/migrate',
  requireBothPlatforms,
  migrationController.startMigration.bind(migrationController)
);

router.get(
  '/migrate/status/:migrationId',
  migrationController.getMigrationStatus.bind(migrationController)
);

module.exports = router;
