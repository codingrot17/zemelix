const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

// Public routes
router.get('/', collectionController.getCollections);
router.get('/:slug', collectionController.getCollectionBySlug);


// Admin routes (add auth middleware here later)
router.post('/', collectionController.createCollection);
router.put('/:slug', collectionController.updateCollection);
router.delete('/:slug', collectionController.deleteCollection);

module.exports = router;
