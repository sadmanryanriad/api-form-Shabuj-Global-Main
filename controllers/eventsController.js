const Event = require("../models/Event");

// Create Event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventStartDate, // Expecting date only (e.g., '2025-03-15')
      eventStartTime, // Expecting time only (e.g., '14:00')
      eventEndDate, // Expecting date only (e.g., '2025-03-15')
      eventEndTime, // Expecting time only (e.g., '16:00')
      place,
      organizer,
      category,
      isOnline,
      eventURL,
      joinURL,
      eventImage,
      imageGallery,
    } = req.body;

    // Validate required fields
    if (!eventStartDate || !eventStartTime || !eventEndDate || !eventEndTime) {
      return res
        .status(400)
        .json({ error: "Start and End date & time are required." });
    }

    const event = new Event({
      title,
      description,
      eventStartDate,
      eventStartTime,
      eventEndDate, 
      eventEndTime,
      place,
      organizer,
      category,
      isOnline,
      eventURL,
      joinURL,
      eventImage,
      imageGallery: Array.isArray(imageGallery) ? imageGallery : [],
    });

    await event.save();
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error creating event", details: error.message });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching events", details: error.message });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching event", details: error.message });
  }
};

// Get event by URL
const getEventByURL = async (req, res) => {
  try {
    const event = await Event.findOne({ eventURL: req.params.url });
    console.log(req.params.url);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching event by URL", details: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { append } = req.query; // Get query parameter (?append=true)
    const updateData = { ...req.body };

    if (req.body.imageGallery) {
      if (!Array.isArray(req.body.imageGallery)) {
        return res.status(400).json({ error: "imageGallery must be an array" });
      }

      if (append === "true") {
        // Append new images to the existing gallery
        const updatedEvent = await Event.findByIdAndUpdate(
          req.params.id,
          { $push: { imageGallery: { $each: req.body.imageGallery } } },
          { new: true }
        );
        return res
          .status(updatedEvent ? 200 : 404)
          .json(updatedEvent || { error: "Event not found" });
      } else {
        // Replace the entire gallery
        updateData.imageGallery = req.body.imageGallery;
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating event", details: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ error: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting event", details: error.message });
  }
};

// Check if eventURL is unique
const checkEventURL = async (req, res) => {
  try {
    const event = await Event.findOne({ eventURL: req.params.eventURL });

    if (event) {
      return res.status(200).json({ exists: true, message: "URL already taken" });
    }

    res.status(200).json({ exists: false, message: "URL available" });
  } catch (error) {
    res.status(500).json({ error: "Error checking URL", details: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventByURL,
  checkEventURL,
};
