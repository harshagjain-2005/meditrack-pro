const express = require('express');
const HistoryController = require('../controllers/historyController');
const router = express.Router();

router.get('/', HistoryController.getHistory);
router.get('/export', HistoryController.exportHistory);

module.exports = router;
