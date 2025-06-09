const Datastore = require('nedb');
const path = require('path');

// Use a path for portability
const db = new Datastore({ filename: path.join(__dirname, '../db/collections.db'), autoload: true });

module.exports = db;
