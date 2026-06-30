const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware); // every route below requires a valid token

router.post('/', logsController.createLog);
router.get('/', logsController.getLogs);
router.delete('/:id', logsController.deleteLog);

module.exports = router;