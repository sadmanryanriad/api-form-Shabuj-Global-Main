const express = require("express");
const router = express.Router();
const {
  createExpoRegistration,
  getExpoRegistrations,
  exportExpoRegistrations,
  exportByEvent,
} = require("../controllers/expoRegistration");

router.post("/", createExpoRegistration);
router.get("/", getExpoRegistrations);
router.get("/export", exportExpoRegistrations); 
router.get("/export/separateByEvent", exportByEvent);

module.exports = router;
