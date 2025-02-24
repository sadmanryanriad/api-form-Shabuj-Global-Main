const express = require("express");
const router = express.Router();
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent, getEventByURL, checkEventURL } = require("../controllers/eventsController");

// Routes for events
router.post("/", createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.get("/eventURL/:url", getEventByURL);     
router.get("/check-event-url/:eventURL", checkEventURL);

module.exports = router;
