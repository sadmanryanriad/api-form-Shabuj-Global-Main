const LiveFeedback = require("../models/LiveFeedback");
const ExcelJS = require("exceljs");

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
// GET: Get all feedbacks (with optional date filter, sorted by latest)
exports.getAllFeedbacks = async (req, res) => {
  try {
    const {
      page = "1",
      perPage = "20",
      sortBy = "desc",
      from, // optional start date
      to,   // optional end date
    } = req.query;

    // Parse pagination values
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(perPage, 10) || 20, 1), 100);

    // Sort direction (asc or desc)
    const sortDir = String(sortBy).toLowerCase() === "asc" ? 1 : -1;
    const sortStage = { createdAt: sortDir };

    // Build filter object
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // include the whole "to" day
        filter.createdAt.$lte = toDate;
      }
    }

    // Count total feedbacks matching filter
    const total = await LiveFeedback.countDocuments(filter);

    // Fetch paginated feedbacks with sorting
    const feedbacks = await LiveFeedback.find(filter)
      .sort(sortStage)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
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

exports.exportLiveFeedback = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const filter = {};

    // Build date filter
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    // Get feedbacks to export (always descending order - newest first)
    const feedbacks = await LiveFeedback.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (!feedbacks.length) {
      return res.status(404).json({ message: "No live feedback found" });
    }

    // Build workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Live Feedback");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Feedback", key: "feedback", width: 60 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    feedbacks.forEach((feedback) => {
      worksheet.addRow({
        name: feedback.name || "",
        email: feedback.email || "",
        feedback: feedback.feedback || "",
        createdAt: feedback.createdAt
          ? new Date(feedback.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      });
    });

    // Create dynamic filename based on date filters
    const dateLabel =
      from && to 
        ? `from_${from}_to_${to}` 
        : new Date().toISOString().split("T")[0];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="LiveFeedback_${dateLabel}.xlsx"`
    );

    // Stream the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting live feedback:", error);
    res.status(500).json({ error: "Failed to export live feedback" });
  }
};