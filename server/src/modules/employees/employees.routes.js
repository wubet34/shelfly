const express = require('express');
const router = express.Router();
const { owner } = require('../../middleware/authenticate');
const { schemas, validated } = require('../../middleware/validation');
const controller = require('./employee.controller');
router.get('/employees', owner, controller.list);
router.post('/employees', owner, validated(schemas.employee), controller.create);
router.patch('/employees/:id', owner, validated(schemas.employeeStatus), controller.setActive);
module.exports = router;
