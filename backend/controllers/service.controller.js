const Service = require('../models/service.model');

// GET all services
exports.getAll = (req, res) => {
  Service.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(docs);
  });
};

// GET single service by _id
exports.getOne = (req, res) => {
  Service.findOne({ _id: req.params.id }, (err, doc) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });
};

// GET all services for a specific collection
exports.getByCollection = (req, res) => {
  Service.find({ collectionId: req.params.collectionId }, (err, docs) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(docs);
  });
};

// CREATE a new service
exports.create = (req, res) => {
  const data = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  Service.insert(data, (err, newDoc) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json(newDoc);
  });
};

// UPDATE a service
exports.update = (req, res) => {
  Service.update(
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

// DELETE a service
exports.remove = (req, res) => {
  Service.remove({ _id: req.params.id }, {}, (err, numRemoved) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!numRemoved) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
};
