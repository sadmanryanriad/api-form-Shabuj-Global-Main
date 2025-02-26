const express = require("express");
const router = express.Router();
const { createRegistration, getAllRegistrations } = require("../controllers/modalRegistration");

router.post("/", createRegistration);  // Store form data
router.get("/", getAllRegistrations);  // Retrieve all form data

module.exports = router;
