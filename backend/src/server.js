const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Quiz App Backend is running" });
});

const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const attemptRoutes = require("./routes/attempt");
const adminRoutes = require("./routes/admin");

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
