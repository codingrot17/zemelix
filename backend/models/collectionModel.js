const { collectionsDB } = require('../db/database');

class CollectionModel {
  static getAll() {
    return new Promise((resolve, reject) => {
      collectionsDB.find({}, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  static getBySlug(slug) {
    return new Promise((resolve, reject) => {
      collectionsDB.findOne({ slug }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  }

  static create(collection) {
    return new Promise((resolve, reject) => {
      collectionsDB.insert(collection, (err, newDoc) => {
        if (err) reject(err);
        else resolve(newDoc);
      });
    });
  }

  static update(slug, updates) {
    return new Promise((resolve, reject) => {
      collectionsDB.update({ slug }, { $set: updates }, {}, (err, numReplaced) => {
        if (err) reject(err);
        else resolve(numReplaced);
      });
    });
  }

  static delete(slug) {
    return new Promise((resolve, reject) => {
      collectionsDB.remove({ slug }, {}, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    });
  }
}

module.exports = CollectionModel;
