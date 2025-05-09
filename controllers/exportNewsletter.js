const ExcelJS = require("exceljs");
const Newsletter = require("../models/Newsletter"); 

exports.exportNewsletter = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const subscribers = await Newsletter.find(filter).sort({ createdAt: -1 }).lean();

    if (!subscribers.length) {
      return res.status(404).json({ message: "No subscribers found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Newsletter Subscribers");

    worksheet.columns = [
      { header: "Email", key: "email", width: 30 },
      { header: "Created At", key: "createdAt", width: 25 }
    ];

    subscribers.forEach((subscriber) => {
      worksheet.addRow({
        email: subscriber.email,
        createdAt: subscriber.createdAt
          ? new Date(subscriber.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "N/A"
      });
    });

    const dateLabel = from && to
      ? `from_${from}_to_${to}`
      : new Date().toISOString().split("T")[0];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Newsletter_${dateLabel}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting newsletter:", error);
    res.status(500).json({ error: "Failed to export newsletter subscribers" });
  }
};
