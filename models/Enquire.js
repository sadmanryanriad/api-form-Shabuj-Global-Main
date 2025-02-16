const mongoose = require("mongoose");

const enquireSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  markAsRead: { type: Boolean, default: false },
});

const Enquire = mongoose.model("Enquire", enquireSchema);
module.exports = Enquire;
