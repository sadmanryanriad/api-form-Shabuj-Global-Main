const express = require("express");
const router = express.Router();
const { exportEnquires } = require("../controllers/exportEnquires");
const { exportApplications } = require("../controllers/exportApplications");

router.get("/enquires", exportEnquires);
router.get("/applications", exportApplications);

module.exports = router;
