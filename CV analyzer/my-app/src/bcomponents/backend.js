const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const multer = require('multer');
const router = require('../routes/uploadroute.js'); // Adjust path if necessary
const storage = require('../database.js'); // Adjust path if necessary
const app = express();
const upload = multer(); // This will handle the file uploads

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyparser.json()); // Parse HTTP requests into `req.body` in JSON form
app.use('/upload', upload.single('file')); // Use multer to handle the uploaded file
app.use('/upload', router); // Use your router for handling file upload logic

// Getting leaderboard backend
app.post("/get-data", async (req, res) => {
  const { usertype } = req.body;  // Extract usertype from the body

  let filePath = '';
  switch (usertype) {
    case "web-designing":
      filePath = "json/web-designing_structured_data.json";
      break;
    case "data-scientist":
      filePath = "json/data-scientist_structured_data.json";
      break;
    case "database-management":
      filePath = "json/database-management_structured_data.json";
      break;
    default:
      return res.status(400).json({ error: "Invalid usertype" });
  }

  try {
    // Fetch file from Supabase
    const { data, error } = await storage.download(filePath);

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }

    const text = await data.text();
    const leaderboardData = JSON.parse(text); // Parse the leaderboard JSON

    res.json({ leaderboard: leaderboardData });  // Send the data back to the frontend
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serverless function export for Vercel
module.exports = (req, res) => {
  app(req, res); // Let Vercel handle the routing
};
