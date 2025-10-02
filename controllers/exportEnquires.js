const Enquire = require("../models/Enquire");
const ExcelJS = require("exceljs");

exports.exportEnquires = async (req, res) => {
  try {
    const { from, to, markAsRead, highlight } = req.query;
    const filter = {};

    // ✅ Date filter
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // include entire "to" day
        filter.createdAt.$lte = toDate;
      }
    }

    // ✅ Boolean filter: markAsRead
    if (markAsRead !== undefined) {
      filter.markAsRead = markAsRead === "true";
    }

    // ✅ Boolean filter: highlight
    if (highlight !== undefined) {
      filter.highlight = highlight === "true";
    }

    // Always sort DESC
    const enquires = await Enquire.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (!enquires.length) {
      return res.status(404).json({ message: "No enquiries found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Enquiries");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Subject", key: "subject", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone Number", key: "phoneNumber", width: 20 },
      { header: "Message", key: "message", width: 40 },
      { header: "Mark As Read", key: "markAsRead", width: 15 },
      { header: "Highlight", key: "highlight", width: 15 },
      { header: "Created At", key: "createdAt", width: 25 },
      { header: "Notes", key: "notes", width: 40 },
      { header: "Status", key: "status", width: 40 },
    ];

    enquires.forEach((enquire) => {
      worksheet.addRow({
        name: enquire.name || "",
        subject: enquire.subject || "",
        email: enquire.email || "",
        phoneNumber: enquire.phoneNumber || "",
        message: enquire.message || "",
        markAsRead: enquire.markAsRead ? "Yes" : "No",
        highlight: enquire.highlight ? "Yes" : "No",
        createdAt: enquire.createdAt
          ? new Date(enquire.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        notes: (enquire.notes || [])
          .map(
            (note) =>
              `${note.note} (${new Date(note.timestamp).toLocaleString("en-GB")})`
          )
          .join(", "),
        status: (enquire.status || [])
          .map(
            (s) =>
              `${s.status} (${new Date(s.timestamp).toLocaleString("en-GB")})`
          )
          .join(", "),
      });
    });

    // Dynamic filename with filters in name
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
      `attachment; filename="Enquiries_${dateLabel}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting enquiries:", error);
    res.status(500).json({ error: "Failed to export enquiries" });
  }
};
