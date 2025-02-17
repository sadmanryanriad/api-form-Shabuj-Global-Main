const mongoose = require("mongoose");

const studentRegistrationSchema = new mongoose.Schema(
  {
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
  },
  { strict: false }
);

const StudentRegistration = mongoose.model("StudentRegistration", studentRegistrationSchema);
module.exports = StudentRegistration;
