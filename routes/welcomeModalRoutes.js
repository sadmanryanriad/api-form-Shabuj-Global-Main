const express = require("express");
const router = express.Router();
const { getWelcomeModal, updateWelcomeModal } = require("../controllers/welcomeModal");

router.get("/", getWelcomeModal);  // Get the current Welcome Modal data
router.put("/", updateWelcomeModal);  // Update the Welcome Modal data

module.exports = router;
