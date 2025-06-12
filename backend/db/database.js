const Datastore = require('nedb');
const path = require('path');

const collectionsDB = new Datastore({ filename: path.join(__dirname, 'collections.db'), autoload: true });
const usersDB = new Datastore({ filename: path.join(__dirname, 'users.db'), autoload: true });

module.exports = { collectionsDB, usersDB };
