const ExcelJS = require("exceljs");
const Apply = require("../models/Apply");

exports.exportApplications = async (req, res) => {
    try {
        const applications = await Apply.find().lean();

        if (!applications.length) {
            return res.status(404).json({ message: "No applications found" });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Applications");

        // Define headers
        worksheet.columns = [
            { header: "Name", key: "name", width: 20 },
            { header: "Email", key: "email", width: 25 },
            { header: "Phone Number", key: "phoneNumber", width: 15 },
            { header: "Study Destination", key: "studyDestination", width: 20 },
            { header: "Study Year", key: "studyYear", width: 15 },
            { header: "Study Intake", key: "studyIntake", width: 15 },
            // { header: "Created At", key: "createdAt", width: 20 },
        ];

        // Add rows with correct date formatting
        applications.forEach((application) => {
            worksheet.addRow({
                ...application,
                createdAt: application.createdAt
                    ? new Date(application.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "N/A",
            });
        });

        // Set response headers for file download
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="Applications.xlsx"');

        // Generate and send the workbook
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error exporting applications:", error);
        res.status(500).json({ error: "Failed to export applications" });
    }
};
