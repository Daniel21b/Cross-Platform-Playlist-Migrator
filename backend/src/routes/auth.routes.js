const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.get('/spotify', authController.initiateSpotifyAuth.bind(authController));
router.get('/spotify/callback', authController.handleSpotifyCallback.bind(authController));

router.get('/youtubemusic', authController.initiateYouTubeMusicAuth.bind(authController));
router.get('/youtubemusic/check', authController.checkYouTubeMusicAuth.bind(authController));

router.get('/status', authController.getAuthStatus.bind(authController));
router.post('/logout', authController.logout.bind(authController));

module.exports = router;
