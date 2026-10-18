const express = require('express');
const router = express.Router();
const { owner } = require('../../middleware/authenticate');
const { schemas, validated } = require('../../middleware/validation');
const controller = require('./product.controller');
router.get('/products', controller.list);
router.post('/products', owner, validated(schemas.product), controller.create);
router.patch('/products/:id', owner, validated(schemas.product), controller.update);
module.exports = router;
