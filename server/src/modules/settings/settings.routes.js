const express = require('express');
const router = express.Router();
const { owner } = require('../../middleware/authenticate');
const { schemas, validated } = require('../../middleware/validation');
const controller = require('./settings.controller');
router.get('/settings', owner, controller.get);
router.patch('/settings', owner, validated(schemas.settings), controller.update);
module.exports = router;
