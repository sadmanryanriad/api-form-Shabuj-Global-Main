const express = require("express");
const router = express.Router();
const {
  createExpoRegistration,
  getExpoRegistrations,
  exportExpoRegistrations,
} = require("../controllers/expoRegistration");

router.post("/", createExpoRegistration);
router.get("/", getExpoRegistrations);
router.get("/export", exportExpoRegistrations); 

module.exports = router;
