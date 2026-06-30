const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, financeController.getFinance);

module.exports = router;