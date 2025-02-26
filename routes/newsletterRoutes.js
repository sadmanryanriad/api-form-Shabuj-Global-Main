const express = require("express");
const router = express.Router();
const { subscribeNewsletter, getAllSubscribers } = require("../controllers/newsletter");

router.post("/", subscribeNewsletter);
router.get("/", getAllSubscribers);

module.exports = router;
