const mongoose = require("mongoose");

const applySchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  phoneNumber: String,
  studyDestination: String,
  studyYear: String,
  studyIntake: String,
  markAsRead: { type: Boolean, default: false },
  isHighlight: { type: Boolean, default: false },
  notes: { type: String, default: "no notes found" }, 
  createdAt: { type: Date, default: Date.now },
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

applySchema.index({ createdAt: -1, _id: -1 });
applySchema.index({ markAsRead: 1, createdAt: -1 });
applySchema.index({ isHighlight: 1, createdAt: -1 });

const Apply = mongoose.model("Apply", applySchema);
module.exports = Apply;
