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
    const { page = "1", perPage = "20", sortBy = "desc" } = req.query;

    // Parse values to integers
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(perPage, 10) || 20, 1), 100);

    // Sort direction (asc or desc)
    const sortDir = String(sortBy).toLowerCase() === "asc" ? 1 : -1;
    const sortStage = { createdAt: sortDir };

    // Query for total number of feedbacks (counting all records before pagination)
    const total = await LiveFeedback.countDocuments();

    // Query for sorted and paginated feedbacks
    const feedbacks = await LiveFeedback.find()
      .sort(sortStage)                          // Sort first by createdAt
      .skip((pageNum - 1) * pageSize)           // Skip the records for pagination
      .limit(pageSize)                          // Limit per page
      .lean();

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    res.status(200).json({
      total,
      totalPages,
      currentPage: pageNum,
      perPage: pageSize,
      sortBy,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
