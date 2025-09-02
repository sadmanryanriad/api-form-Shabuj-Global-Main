const Enquire = require("../models/Enquire");

const getEnquires = async (req, res) => {
  try {
    // Get pagination and sorting params from query (defaults: page = 1, perPage = 20, sortBy = 'desc')
    const { page = "1", perPage = "20", sortBy = "desc" } = req.query;

    // Parse values to integers
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(perPage, 10) || 20, 1), 100);

    // Sort direction (asc or desc)
    const sortDir = String(sortBy).toLowerCase() === "asc" ? 1 : -1;
    const sortStage = { createdAt: sortDir };

    // Query for total number of enquiries (counting all records before pagination)
    const total = await Enquire.countDocuments();

    // Query for sorted and paginated enquiries
    const enquiries = await Enquire.find()
      .sort(sortStage)                          // Sort first
      .skip((pageNum - 1) * pageSize)           // Then paginate (skip for page)
      .limit(pageSize)                          // Limit per page
      .lean();

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    res.status(200).json({
      total,
      totalPages,
      currentPage: pageNum,
      perPage: pageSize,
      sortBy,
      enquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries: ", error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
};

module.exports = getEnquires;
