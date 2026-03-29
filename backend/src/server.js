const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const pollRoutes = require("./routes/pollRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use("/api/polls", pollRoutes);

async function startServer() {
  try {
    await db.query("SELECT NOW()");
    console.log("Database connection established.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to database:", error);
    process.exit(1);
  }
}

startServer();