const { usersDB } = require('../db/database');
const bcrypt = require('bcryptjs');

class UserModel {
  static async create({ name, email, password, role }) {
    const hashed = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      usersDB.insert({ name, email, password: hashed, role }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      usersDB.findOne({ email }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      usersDB.findOne({ _id: id }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  }
}

module.exports = UserModel;
