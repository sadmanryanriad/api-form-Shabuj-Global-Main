const mongoose = require("mongoose");

const studentRegistrationSchema = new mongoose.Schema({}, { strict: false });

const StudentRegistration = mongoose.model(
  "StudentRegistration",
  studentRegistrationSchema
);

module.exports = StudentRegistration;
