const mongoose = require("mongoose");

const studentRegistrationSchema = new mongoose.Schema(
  {
    markAsRead: { type: Boolean, default: false },
    note: {
      type: String,
      default: "no notes found",
    },
  },
  { strict: false }
);

const StudentRegistration = mongoose.model(
  "StudentRegistration",
  studentRegistrationSchema
);
module.exports = StudentRegistration;
