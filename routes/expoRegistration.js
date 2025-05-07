const express = require("express");
const router = express.Router();
const {
  createExpoRegistration,
  getExpoRegistrations,
} = require("../controllers/expoRegistration");

router.post("/", createExpoRegistration);
router.get("/", getExpoRegistrations);

module.exports = router;
