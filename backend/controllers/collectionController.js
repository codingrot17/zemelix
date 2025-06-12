const CollectionService = require('../services/collectionService');

exports.getCollections = async (req, res, next) => {
  try {
    const collections = await CollectionService.listCollections();
    res.json(collections);
  } catch (error) {
    next(error);
  }
};
exports.getCollectionBySlug = async (req, res, next) => {
  try {
    const collection = await CollectionService.getCollection(req.params.slug);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    res.json(collection);
  } catch (error) {
    next(error);
  }
};



exports.createCollection = async (req, res, next) => {
  try {
    const newCollection = await CollectionService.addCollection(req.body);
    res.status(201).json(newCollection);
  } catch (error) {
    next(error);
  }
};

exports.updateCollection = async (req, res, next) => {
  try {
    const updated = await CollectionService.updateCollection(req.params.slug, req.body);
    if (updated === 0) return res.status(404).json({ message: 'Collection not found' });
    res.json({ message: 'Collection updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteCollection = async (req, res, next) => {
  try {
    const deleted = await CollectionService.deleteCollection(req.params.slug);
    if (deleted === 0) return res.status(404).json({ message: 'Collection not found' });
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    next(error);
  }
};
