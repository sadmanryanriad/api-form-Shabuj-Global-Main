const mongoose = require("mongoose");

const applySchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  phoneNumber: String,
  studyDestination: String,
  studyYear: String,
  studyIntake: String,
  markAsRead: { type: Boolean, default: false },
  notes: [
    {
      note: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Apply = mongoose.model("Apply", applySchema);
module.exports = Apply;
