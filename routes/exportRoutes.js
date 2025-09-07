const express = require("express");
const router = express.Router();
const { exportEnquires } = require("../controllers/exportEnquires");
const { exportApplications } = require("../controllers/exportApplications");
const { exportNewsletter } = require("../controllers/exportNewsletter");
const { exportExpoRegistrations } = require("../controllers/exportExpoRegistrations");

router.get("/enquires", exportEnquires);
router.get("/applications", exportApplications);
router.get("/newsletter", exportNewsletter);
router.get("/expo-registrations", exportExpoRegistrations);

module.exports = router;
