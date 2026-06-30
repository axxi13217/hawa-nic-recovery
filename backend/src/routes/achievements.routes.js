const express = require('express');
const router = express.Router();
const achievementsController = require('../controllers/achievements.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, achievementsController.getAchievements);

module.exports = router;