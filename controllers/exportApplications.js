const ExcelJS = require("exceljs");
const Apply = require("../models/Apply");

exports.exportApplications = async (req, res) => {
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

    // Get applications to export
    const applications = await Apply.find(filter).sort({ createdAt: -1 }).lean();

    if (!applications.length) {
      return res.status(404).json({ message: "No applications found" });
    }

    // Collect IDs to mark read later (only what we exported)
    const exportedIds = applications.map((a) => a._id);

    // Build workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Applications");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone Number", key: "phoneNumber", width: 20 },
      { header: "Study Destination", key: "studyDestination", width: 25 },
      { header: "Study Year", key: "studyYear", width: 15 },
      { header: "Study Intake", key: "studyIntake", width: 15 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    applications.forEach((app) => {
      worksheet.addRow({
        name: app.name || "",
        email: app.email || "",
        phoneNumber: app.phoneNumber || "",
        studyDestination: app.studyDestination || "",
        studyYear: app.studyYear || "",
        studyIntake: app.studyIntake || "",
        createdAt: app.createdAt
          ? new Date(app.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      });
    });

    const dateLabel =
      from && to ? `from_${from}_to_${to}` : new Date().toISOString().split("T")[0];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Applications_${dateLabel}.xlsx"`
    );

    // After streaming completes successfully, mark exported docs as read
    res.once("finish", async () => {
      try {
        await Apply.updateMany(
          { _id: { $in: exportedIds }, markAsRead: { $ne: true } },
          { $set: { markAsRead: true } }
        );
      } catch (e) {
        console.error("Failed to mark exported applications as read:", e);
      }
    });

    // Stream the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting applications:", error);
    res.status(500).json({ error: "Failed to export applications" });
  }
};
