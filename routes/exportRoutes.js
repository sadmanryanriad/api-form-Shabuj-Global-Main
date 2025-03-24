const express = require("express");
const router = express.Router();
const { exportEnquires } = require("../controllers/exportEnquires");

router.get("/enquires", exportEnquires);

module.exports = router;
