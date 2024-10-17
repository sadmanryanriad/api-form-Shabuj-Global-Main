const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5005;
const uri = process.env.MONGODB_URI;

//middlewares
// Allow requests from specific origin and support credentials
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://api-form.studyuk.today",
    "http://api-form.studyuk.today",
  ],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For JSON payloads
// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Home API returning simple HTML
app.get("/", (req, res) => {
  res.send("<h1>Home Page</h1> <p>api-form-Shabuj-Global-Main</p>");
});

// Import Enquire model
const enquire = require("./controllers/enquire");
const apply = require("./controllers/apply");

// Form API to handle subject, email, and enquire data
app.post("/enquire", enquire);

//Form API to handle name, email, phoneNumber, StudyDestination, StudyYear, StudyIntake
app.post("/apply", apply);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
