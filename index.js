const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 5005;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For JSON payloads

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/api-form")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Home API returning simple HTML
app.get("/", (req, res) => {
  res.send("<h1>Home Page</h1> <p>api-form-Shabuj-Global-Main</p>");
});

// Import Enquire model
const enquire  = require("./controllers/enquire");

// Form API to handle subject, email, and enquire data
app.post("/enquire", enquire);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
