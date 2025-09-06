const Enquire = require("../models/Enquire");

const getEnquires = async (req, res) => {
  try {
    // Get pagination, sorting, and date filter params from query
    const {
      page = "1",
      perPage = "20",
      sortBy = "createdAt",    // Field to sort by (default: createdAt)
      sortOrder = "desc",      // Direction: asc or desc (default: desc)
      from, // optional start date
      to,   // optional end date
    } = req.query;

    // Parse pagination values
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(perPage, 10) || 20, 1), 100);

    // Sort direction (asc or desc)
    const sortDir = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;
    const sortStage = {};
    sortStage[sortBy] = sortDir;

    // Build filter object
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // include full "to" day
        filter.createdAt.$lte = toDate;
      }
    }

    // Count total enquiries matching filter
    const total = await Enquire.countDocuments(filter);

    // Fetch sorted and paginated enquiries
    const enquiries = await Enquire.find(filter)
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
      sortBy,      // Field name
      sortOrder,   // Direction
      enquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries: ", error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
};

module.exports = getEnquires;