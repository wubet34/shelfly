const express = require('express');
const router = express.Router();
const { owner } = require('../../middleware/authenticate');
const { schemas, validated } = require('../../middleware/validation');
const controller = require('./expense.controller');
router.get('/expenses', owner, controller.list);
router.post('/expenses', owner, validated(schemas.expense), controller.create);
module.exports = router;
