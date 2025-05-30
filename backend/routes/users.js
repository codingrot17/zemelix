const express = require('express');
const router = express.Router();
const Datastore = require('nedb');
const usersDB = new Datastore({ filename: './db/users.db', autoload: true });

// Create user
router.post('/register', (req, res) => {
  const user = req.body;
  usersDB.insert(user, (err, newUser) => {
    if (err) return res.status(500).send(err);
    res.status(201).send(newUser);
  });
});

module.exports = router;
