const CollectionModel = require('../models/collectionModel');

class CollectionService {
  static async listCollections() {
    return await CollectionModel.getAll();
  }

  static async getCollection(slug) {
    return await CollectionModel.getBySlug(slug);
  }

  static async addCollection(data) {
    // Add validation or business rules here if needed
    return await CollectionModel.create(data);
  }

  static async updateCollection(slug, data) {
    return await CollectionModel.update(slug, data);
  }

  static async deleteCollection(slug) {
    return await CollectionModel.delete(slug);
  }
}

module.exports = CollectionService;
