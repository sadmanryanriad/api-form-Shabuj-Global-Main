const Apply = require("../models/Apply");

module.exports = async function getApplications(req, res) {
  try {
    let { page = "1", perPage = "20", sortBy = "desc" } = req.query;

    // normalize inputs
    const sortDir = String(sortBy).toLowerCase() === "asc" ? 1 : -1;
    const sortStage = { createdAt: sortDir, _id: sortDir };

    // count total first (used in both modes)
    const total = await Apply.countDocuments({});

    // "all" mode — return everything (sorted)
    if (String(perPage).toLowerCase() === "all") {
      const items = await Apply.find({})
        .sort(sortStage)
        .lean();

      return res.status(200).json({
        items,
        pageInfo: {
          mode: "all",
          page: 1,
          perPage: "all",
          sortBy: sortDir === 1 ? "asc" : "desc",
          total,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    // paginated mode
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(perPage, 10) || 20, 1), 100);

    const items = await Apply.find({})
      .sort(sortStage)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    return res.status(200).json({
      items,
      pageInfo: {
        mode: "page",
        page: pageNum,
        perPage: pageSize,
        sortBy: sortDir === 1 ? "asc" : "desc",
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};



// Example requests

// Default (page 1, 20 per page, newest first):
// GET /applications

// Page 3, 20 per page, newest first:
// GET /applications?page=3&perPage=20&sortBy=desc

// 50 per page, oldest first:
// GET /applications?perPage=50&sortBy=asc

// Get everything (be careful on huge collections):
// GET /applications?perPage=all&sortBy=desc