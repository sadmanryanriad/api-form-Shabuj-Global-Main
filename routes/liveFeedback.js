const express = require("express");
const router = express.Router();
const { submitFeedback, getAllFeedbacks } = require("../controllers/liveFeedback");

router.post("/", submitFeedback);
router.get("/", getAllFeedbacks);

module.exports = router;
