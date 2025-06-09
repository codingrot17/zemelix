const Collection = require('../models/collection.model');

// GET all collections
exports.getAll = (req, res) => {
  Collection.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(docs);
  });
};

// GET single collection by _id
exports.getOne = (req, res) => {
  Collection.findOne({ _id: req.params.id }, (err, doc) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });
};

// CREATE a new collection
exports.create = (req, res) => {
  const data = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  Collection.insert(data, (err, newDoc) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json(newDoc);
  });
};

// UPDATE a collection
exports.update = (req, res) => {
  Collection.update(
    { _id: req.params.id },
    { $set: { ...req.body, updatedAt: new Date() } },
    { returnUpdatedDocs: true },
    (err, numAffected, affectedDoc) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!affectedDoc) return res.status(404).json({ error: 'Not found' });
      res.json(affectedDoc);
    }
  );
};

// DELETE a collection
exports.remove = (req, res) => {
  Collection.remove({ _id: req.params.id }, {}, (err, numRemoved) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!numRemoved) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
};
