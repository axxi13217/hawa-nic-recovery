const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timeline.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, timelineController.getTimeline);

module.exports = router;