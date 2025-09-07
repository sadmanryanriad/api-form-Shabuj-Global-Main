const ExcelJS = require("exceljs");
const ExpoRegistration = require("../models/ExpoRegistration");

exports.exportExpoRegistrations = async (req, res) => {
  try {
    const {
      from,
      to,
      eventId,
      eventSourceLink,
      referralCode,
      studyDestination,
      highlight,
      markAsRead,
    } = req.query;

    const filter = {};

    // Date range filter
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    if (eventId) filter.eventId = eventId;
    if (eventSourceLink) filter.eventSourceLink = eventSourceLink;
    if (referralCode) filter.referralCode = referralCode;

    // Study Destinations filter (include both studyDestinations array & otherStudyDestination)
    if (studyDestination) {
      filter.$or = [
        { studyDestinations: studyDestination },
        { otherStudyDestination: { $regex: new RegExp(`^${studyDestination}$`, "i") } },
      ];
    }

    // Highlight filter
    if (highlight !== undefined) {
      if (highlight === 'true' || highlight === true) {
        filter.highlight = true;
      } else if (highlight === 'false' || highlight === false) {
        filter.highlight = false;
      }
    }

    // MarkAsRead filter
    if (markAsRead !== undefined) {
      if (markAsRead === 'true' || markAsRead === true) {
        filter.markAsRead = true;
      } else if (markAsRead === 'false' || markAsRead === false) {
        filter.markAsRead = false;
      }
    }

    // Get expo registrations to export (always descending order)
    const registrations = await ExpoRegistration.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (!registrations.length) {
      return res.status(404).json({ message: "No expo registrations found" });
    }

    // Collect IDs to mark read later (only what we exported)
    const exportedIds = registrations.map((r) => r._id);

    // Build workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expo Registrations");

    worksheet.columns = [
      { header: "Full Name", key: "fullName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Country Code", key: "countryCode", width: 15 },
      { header: "Phone Number", key: "phoneNumber", width: 20 },
      { header: "Citizenship", key: "citizenship", width: 20 },
      { header: "Residence", key: "residence", width: 20 },
      { header: "Study Destinations", key: "studyDestinations", width: 30 },
      { header: "Other Study Destination", key: "otherStudyDestination", width: 25 },
      { header: "Preferred Study Level", key: "preferredStudyLevel", width: 20 },
      { header: "Other Study Level", key: "otherStudyLevel", width: 20 },
      { header: "Academic History", key: "academicHistory", width: 40 },
      { header: "English Test", key: "englishTest", width: 15 },
      { header: "English Score", key: "englishScore", width: 15 },
      { header: "No English Cert", key: "noEnglishCert", width: 15 },
      { header: "Work Experience", key: "workExperience", width: 15 },
      { header: "Work Details", key: "workDetails", width: 30 },
      { header: "Event Source Name", key: "eventSourceName", width: 25 },
      { header: "Event Source Link", key: "eventSourceLink", width: 30 },
      { header: "Event ID", key: "eventId", width: 15 },
      { header: "Referral Code", key: "referralCode", width: 20 },
      { header: "Additional Info", key: "additionalInfo", width: 30 },
      { header: "Consent Terms", key: "consentToTerms", width: 15 },
      { header: "Highlighted", key: "highlight", width: 12 },
      { header: "Mark As Read", key: "markAsRead", width: 15 },
      { header: "Notes", key: "notes", width: 40 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    registrations.forEach((reg) => {
      worksheet.addRow({
        fullName: reg.fullName || "",
        email: reg.email || "",
        countryCode: reg.countryCode || "",
        phoneNumber: reg.phoneNumber || "",
        citizenship: reg.citizenship || "",
        residence: reg.residence || "",
        studyDestinations: Array.isArray(reg.studyDestinations) 
          ? reg.studyDestinations.join(", ") 
          : "",
        otherStudyDestination: reg.otherStudyDestination || "",
        preferredStudyLevel: reg.preferredStudyLevel || "",
        otherStudyLevel: reg.otherStudyLevel || "",
        academicHistory: Array.isArray(reg.academicHistory) 
          ? JSON.stringify(reg.academicHistory) 
          : "",
        englishTest: reg.englishTest || "",
        englishScore: reg.englishScore || "",
        noEnglishCert: reg.noEnglishCert ? "Yes" : "No",
        workExperience: reg.workExperience || "",
        workDetails: reg.workDetails || "",
        eventSourceName: reg.eventSourceName || "",
        eventSourceLink: reg.eventSourceLink || "",
        eventId: reg.eventId || "",
        referralCode: reg.referralCode || "",
        additionalInfo: Array.isArray(reg.additionalInfo) 
          ? JSON.stringify(reg.additionalInfo) 
          : "",
        consentToTerms: reg.consentToTerms ? "Yes" : "No",
        highlight: reg.highlight ? "Yes" : "No",
        markAsRead: reg.markAsRead ? "Yes" : "No",
        notes: Array.isArray(reg.notes) 
          ? reg.notes.join(" | ") 
          : "",
        createdAt: reg.createdAt
          ? new Date(reg.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      });
    });

    // Create dynamic filename based on filters
    let filenameParts = ["ExpoRegistrations"];
    if (from && to) filenameParts.push(`from_${from}_to_${to}`);
    if (eventId) filenameParts.push(`event_${eventId}`);
    if (highlight === 'true') filenameParts.push("highlighted");
    if (markAsRead === 'false') filenameParts.push("unread");
    if (studyDestination) filenameParts.push(`dest_${studyDestination}`);
    
    const filename = filenameParts.length > 1 
      ? filenameParts.join("_") + ".xlsx"
      : `ExpoRegistrations_${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // After streaming completes successfully, mark exported docs as read
    res.once("finish", async () => {
      try {
        await ExpoRegistration.updateMany(
          { _id: { $in: exportedIds }, markAsRead: { $ne: true } },
          { $set: { markAsRead: true } }
        );
        console.log(`Marked ${exportedIds.length} expo registrations as read`);
      } catch (e) {
        console.error("Failed to mark exported expo registrations as read:", e);
      }
    });

    // Stream the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting expo registrations:", error);
    res.status(500).json({ error: "Failed to export expo registrations" });
  }
};