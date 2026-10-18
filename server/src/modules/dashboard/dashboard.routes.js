const express = require('express');
const router = express.Router();
const { owner } = require('../../middleware/authenticate');
const controller = require('./dashboard.controller');
router.get('/dashboard', owner, controller.getSummary);
module.exports = router;
