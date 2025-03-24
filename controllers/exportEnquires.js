const Enquire = require("../models/Enquire");
const ExcelJS = require("exceljs");

exports.exportEnquires = async (req, res) => {
  try {
    const enquires = await Enquire.find();

    if (!enquires.length) {
      return res.status(404).json({ message: "No enquiries found" });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Enquiries");

    // Add headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Subject", key: "subject", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Message", key: "message", width: 40 },
      { header: "Created At", key: "createdAt", width: 20 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Status", key: "status", width: 30 },
    ];

    // Add data rows
    enquires.forEach((enquire) => {
      worksheet.addRow({
        name: enquire.name,
        subject: enquire.subject,
        email: enquire.email,
        message: enquire.message,
        createdAt: new Date(enquire.createdAt).toLocaleString(),
        notes: enquire.notes
          .map(
            (note) =>
              `${note.note} (${new Date(note.timestamp).toLocaleString()})`
          )
          .join(", "),
        status: enquire.status
          .map((s) => `${s.status} (${new Date(s.timestamp).toLocaleString()})`)
          .join(", "),
      });
    });

    // Get the current date and format it
    const currentDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // Set response headers for file download, including the formatted date in the filename
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=enquiries_${currentDate}.xlsx`
    );

    // Generate and send the workbook
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
