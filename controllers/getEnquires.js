const Enquire = require("../models/Enquire");

const getEnquires = async (req, res) => {
  try {
    // Get pagination params from query (defaults: page = 1, perPage = 20)
    const { page = "1", perPage = "20" } = req.query;

    // Parse values to integers
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(perPage, 10) || 20, 1), 100);

    // Query for enquiries with pagination
    const [enquiries, total] = await Promise.all([
      Enquire.find()
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Enquire.countDocuments(),
    ]);

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    res.status(200).json({
      total,
      totalPages,
      currentPage: pageNum,
      perPage: pageSize,
      enquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries: ", error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
};

module.exports = getEnquires;
