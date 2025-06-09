const express = require('express');
const router = express.Router();
const controller = require('../controllers/collection.controller');

// Define routes
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router; // <-- THIS IS IMPORTANT
