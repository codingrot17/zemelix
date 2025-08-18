const { usersDB } = require("../db/database");
const bcrypt = require("bcryptjs");

class UserModel {
    static async create({ name, email, password, role }) {
        const hashed = await bcrypt.hash(password, 12);
        return new Promise((resolve, reject) => {
            const userData = {
                name,
                email: email.toLowerCase(),
                password: hashed,
                role,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            usersDB.insert(userData, (err, doc) => {
                if (err) reject(err);
                else {
                    const { password: _, ...userWithoutPassword } = doc;
                    resolve(userWithoutPassword);
                }
            });
        });
    }

    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            usersDB.findOne({ email: email.toLowerCase() }, (err, doc) => {
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

    static async updateUser(id, updates) {
        return new Promise((resolve, reject) => {
            const updateData = { ...updates, updatedAt: new Date() };
            usersDB.update(
                { _id: id },
                { $set: updateData },
                {},
                (err, numReplaced) => {
                    if (err) reject(err);
                    else resolve(numReplaced);
                }
            );
        });
    }
}

module.exports = UserModel;