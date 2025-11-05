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
    "https://sge-next-3.vercel.app",
    // "https://sge-crawl-testing.vercel.app", //temp
    // "https://shadcn-ui-test-delta.vercel.app",//temp
  ],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

// Middleware to parse form data
// Parse large JSON / form bodies (put this AFTER CORS, BEFORE routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Return clean JSON when the JSON body is invalid
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      message: 'Invalid JSON in request body. Ensure the client JSON.stringify()s the payload.',
      details: err.message,
    });
  }
  next(err);
});


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
// Import Export routes
const exportRoutes = require("./routes/exportRoutes");
// Import expo registration routes
const expoRegistrationRoute = require("./routes/expoRegistration");
// Import live feedback routes
const liveFeedbackRoute = require("./routes/liveFeedback");

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

//Student Registration Route  // Remove this line in future. when we move onto our new repo and no longer need this route
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

// Export routes
app.use("/export", exportRoutes);

// API to get all expo registrations
app.use("/expoRegistration", expoRegistrationRoute);

// API to handle live feedback
app.use("/live-feedback", liveFeedbackRoute);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
