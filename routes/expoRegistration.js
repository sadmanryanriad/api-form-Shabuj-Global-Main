const express = require("express");
const router = express.Router();
const {
  createExpoRegistration,
  getExpoRegistrations,
  exportExpoRegistrations,
  exportByEvent,
  updateExpoRegistration
} = require("../controllers/expoRegistration");

router.post("/", createExpoRegistration);
router.get("/", getExpoRegistrations);
//exports routes
router.get("/export", exportExpoRegistrations); 
router.get("/export/separateByEvents", exportByEvent);
// PATCH routes
router.patch("/:id", updateExpoRegistration);

module.exports = router;
