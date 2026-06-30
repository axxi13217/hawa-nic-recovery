const express = require('express');
const router = express.Router();
const streaksController = require('../controllers/streaks.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, streaksController.getStreaks);

module.exports = router;