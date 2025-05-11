const LiveFeedback = require("../models/LiveFeedback");

exports.submitFeedback = async (req, res) => {
  try {
    const feedback = new LiveFeedback(req.body);
    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// GET: Get all feedbacks (optional: sorted by latest)
exports.getAllFeedbacks = async (req, res) => {
    try {
      const feedbacks = await LiveFeedback.find().sort({ createdAt: -1 });
      res.status(200).json({ total: feedbacks.length, data: feedbacks });
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  