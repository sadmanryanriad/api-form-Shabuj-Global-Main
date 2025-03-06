const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    eventImage: { type: String, trim: true }, // URL of event image (optional)
    eventLargeImage: { type: String, trim: true }, // Large screen image
    eventPhoneImage: { type: String, trim: true }, // Mobile screen image
    imageGallery: [{ type: String, trim: true }], // Array of image URLs
    videoURL: { type: String, trim: true }, // YouTube/Vimeo/Twitch/facebook/dailyMotion/Local URL
    description: { type: String, trim: true }, // Description (optional)
    place: { type: String, trim: true }, // Venue or online (optional)
    isOnline: { type: Boolean, default: false }, // Online or in-person
    joinURL: { type: String }, // Direct join link (optional, useful for Zoom, Google Meet, etc.)
    eventRegistrationForm: {type: String, trim: true}, // Registration link for the event (optional)
    eventStartDate: { type: String, trim: true }, // Date part of the event start
    eventStartTime: { type: String, trim: true }, // Time part of the event start
    eventEndDate: { type: String, trim: true }, // Date part of the event end 
    eventEndTime: { type: String, trim: true }, // Time part of the event end
    organizer: { type: String, trim: true }, // Event host (optional)
    category: { type: String, trim: true }, // Workshop, Seminar, etc. (optional)
    eventURL: { 
      type: String, 
      required: true, 
      trim: true, 
      unique: true,
      lowercase: true, 
      validate: {
        validator: function (value) {
          return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
        },
        message: "eventURL can only contain lowercase letters, numbers (1-9), and hyphens (-) between words.",
      },
    },
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt'
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
