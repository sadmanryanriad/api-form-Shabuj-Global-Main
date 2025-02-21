const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    eventImage: { type: String, trim: true }, // URL of event image (optional)
    imageGallery: [{ type: String, trim: true }], // Array of image URLs
    description: { type: String, trim: true }, // Description (optional)
    place: { type: String, trim: true }, // Venue or online (optional)
    isOnline: { type: Boolean, default: false }, // Online or in-person
    joinURL: { type: String, }, // Direct join link (optional, useful for Zoom, Google Meet, etc.)
    eventStartDateTime: { type: String, required: true, trim: true }, // Stored as string
    eventEndDateTime: { type: String, required: true, trim: true }, // Stored as string
    organizer: { type: String, trim: true }, // Event host (optional)
    category: { type: String, trim: true }, // Workshop, Seminar, etc. (optional)
    eventURL: { type: String, trim: true }, // Link for online events (optional)
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt'
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
