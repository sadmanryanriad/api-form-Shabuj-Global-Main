const mongoose = require("mongoose");

const studentRegistrationSchema = new mongoose.Schema(
  {
    markAsRead: { type: Boolean, default: false }
  },
  { strict: false }
);

const StudentRegistration = mongoose.model("StudentRegistration", studentRegistrationSchema);
module.exports = StudentRegistration;
