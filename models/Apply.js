const mongoose = require("mongoose");

const applySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  studyDestination: {
    type: String,
  },
  studyYear: {
    type: String,
  },
  studyIntake: {
    type: String,
  },
});

const Apply = mongoose.model("Apply", applySchema);

module.exports = Apply;
