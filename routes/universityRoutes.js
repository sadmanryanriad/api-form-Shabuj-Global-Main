// routes/universityRoutes.js
const express = require("express");
const router = express.Router();

const {
  createUniversity,
  updateUniversity,
  deleteUniversity,
  checkUniversityUrl,
  getUniversityCountries,
  getUniversitiesByCountry,
  getUniversityByUrl,
  getAllUniversities,
} = require("../controllers/university");

// Create university
router.post("/", createUniversity);

// Get all universities (optional, but usually needed)
router.get("/", getAllUniversities);

// Unique URL checker
// GET /universities/check-url/:universityUrl
router.get("/check-url/:universityUrl", checkUniversityUrl);

// Distinct countries list
// GET /universities/countries
router.get("/countries", getUniversityCountries);

// Universities by country
// GET /universities/country/:country
router.get("/country/:country", getUniversitiesByCountry);

// Single university by URL
// GET /universities/:universityUrl
router.get("/:universityUrl", getUniversityByUrl);

// Update university by URL
// PATCH /universities/:universityUrl
router.patch("/:universityUrl", updateUniversity);

// Delete university by URL
// DELETE /universities/:universityUrl
router.delete("/:universityUrl", deleteUniversity);

module.exports = router;
