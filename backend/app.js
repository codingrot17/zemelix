const express = require('express');
const app = express();
const collectionRoutes = require('./routes/collectionRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
app.use(cors());

app.use(express.json());

// API routes
app.use('/api/collections', collectionRoutes);
app.use('/api/auth', authRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
