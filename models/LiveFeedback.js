const mongoose = require("mongoose");

const liveFeedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    //   required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    //   match: [/.+\@.+\..+/, "Invalid email format"],
    },
    feedback: {
      type: String,
      required: [true, "Feedback is required"],
      trim: true,
      minlength: [5, "Feedback must be at least 5 characters"],
      maxlength: [5000, "Name cannot exceed 5000 characters"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveFeedback", liveFeedbackSchema);
