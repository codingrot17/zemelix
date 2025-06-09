const express = require('express');
const router = express.Router();
const controller = require('../controllers/service.controller');

// GET /api/services
router.get('/', controller.getAll);

// GET /api/services/:id
router.get('/:id', controller.getOne);

// POST /api/services
router.post('/', controller.create);

// PUT /api/services/:id
router.put('/:id', controller.update);

// DELETE /api/services/:id
router.delete('/:id', controller.remove);

module.exports = router;
