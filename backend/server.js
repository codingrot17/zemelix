const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Import and use your route modules (to be created in next steps)
app.use("/api/collections", require("./routes/collections"));
app.use("/api/services", require("./routes/services"));
// app.use("/api/users", require("./routes/users"));

// Error handler (optional, to be added later)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Marketplace backend running on http://localhost:${PORT}`);
});
