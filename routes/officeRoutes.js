const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// Add a new office to a country
router.post("/", addressController.addOffice);  // country as query param

// Update a specific office inside a country
router.patch("/:officeId", addressController.updateOffice);

// Delete an office from a country
router.delete("/:officeId", addressController.deleteOffice);

// Get Office counts for each country
router.get("/getOfficeCounts", addressController.getOfficeCounts );

// Get all offices of a country, or specific office by officeId
router.get("/", addressController.getOfficesByCountry); // Accepting country as query param

module.exports = router;
