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
    "https://next.studyuk.today",
    "http://next.studyuk.today",
    "https://sge-next-2.vercel.app",
    "http://sge-next-2.vercel.app",
    "https://develop.shabujglobal.com",
    "http://develop.shabujglobal.com",
    "https://shabujglobal.com",
    "http://shabujglobal.com",
    "https://www.shabujglobal.com",
    "http://www.shabujglobal.com",
    "https://sgelist.netlify.app",
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

// Import
const enquire = require("./controllers/enquire");
const apply = require("./controllers/apply");
const studentRegistrationRoute = require("./routes/studentRegistration");
const getEnquires = require("./controllers/getEnquires");
const getApplications = require("./controllers/getApplications");
// Import patch controllers
const applyPatch = require("./controllers/patches/applyPatch");
const enquirePatch = require("./controllers/patches/enquirePatch");
const studentRegistrationPatch = require("./controllers/patches/studentRegistrationPatch");
// Import event routes
const eventRoutes = require("./routes/eventRoutes");
// Import office routes
const officeRoutes = require("./routes/officeRoutes");
// Import newsletter routes
const newsletterRoutes = require("./routes/newsletterRoutes");
// Import modal Registration routes
const modalRegistrationRoutes = require("./routes/modalRegistration");
// Import blog routes
const blogRoutes = require("./routes/blogRoutes");
// Import welcome modal routes
const welcomeModalRoutes = require("./routes/welcomeModalRoutes");

// Form API to handle subject, email, and enquire data
app.post("/enquire", enquire);
// API to get all enquiries
app.get("/enquires", getEnquires);
// To patch
app.patch("/enquires/:id", enquirePatch);

//Form API to handle name, email, phoneNumber, StudyDestination, StudyYear, StudyIntake
app.post("/apply", apply);
// API to get all applications
app.get("/applications", getApplications);
// To patch
app.patch("/applications/:id", applyPatch);

//Student Registration Route
app.use("/studentRegistration", studentRegistrationRoute);
// To patch
app.patch("/studentRegistration/:id", studentRegistrationPatch);

// Events API
app.use("/events", eventRoutes);

// Base route for offices
app.use("/offices", officeRoutes);

// Use Routes
app.use("/newsletter", newsletterRoutes);

// Blog routes
app.use("/blogs", blogRoutes);

// Welcome modal Routes
app.use("/welcome-modal", welcomeModalRoutes); 

// Modal Registration routes
app.use("/modal-registration", modalRegistrationRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
