const ExpoRegistration = require("../models/ExpoRegistration");
const ExcelJS = require("exceljs");
const axios = require("axios");

// POST: Create a new expo registration
exports.createExpoRegistration = async (req, res) => {
  try {
    const { recaptchaToken, message, ...formData } = req.body;
    // Honeypot bot detection
    if (message && message.trim().length > 0) {
      console.warn("Bot detected via honeypot. Ignoring submission.");
      console.log(
        `Honeypot triggered by IP: ${
          req.ip
        } - Time: ${new Date().toISOString()}`
      );
      // pretend it's successful
      return res
        .status(200)
        .json({ message: "Apply created successfully bro 😉" });
    }

    // Verify reCAPTCHA token
    try {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
      const { data } = await axios.post(
        verifyUrl,
        new URLSearchParams({
          secret: secretKey,
          response: recaptchaToken,
        })
      );

      if (!data.success) {
        return res
          .status(400)
          .json({ message: "reCAPTCHA verification failed" });
      }
    } catch (verifyErr) {
      console.error("reCAPTCHA error:", verifyErr);
      return res.status(500).json({ message: "Error verifying reCAPTCHA" });
    }

    // Save only valid form data (excluding recaptchaToken)
    const newEntry = new ExpoRegistration(formData);
    await newEntry.save();
    res
      .status(201)
      .json({ message: "Expo registration saved", data: newEntry });
  } catch (error) {
    console.error("Error saving expo registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET: Fetch expo registrations (with optional filtering by date range)
exports.getExpoRegistrations = async (req, res) => {
  try {
    const { from, to, eventId, eventSourceLink, referralCode } = req.query;
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

    const data = await ExpoRegistration.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ total: data.length, data });
  } catch (error) {
    console.error("Error fetching expo registrations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export Expo Registrations to Excel
exports.exportExpoRegistrations = async (req, res) => {
  try {
    const { from, to, eventSourceLink  } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};

      if (from) filter.createdAt.$gte = new Date(from);

      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // Set 'to' the end of the day
        filter.createdAt.$lte = toDate;
      }
    }
    if (eventSourceLink) {
      filter.eventSourceLink = eventSourceLink;
    }

    // Fetch the expo registrations
    const registrations = await ExpoRegistration.find(filter).sort({
      createdAt: -1,
    });

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expo Registrations");

    // Define columns for the Excel sheet
    worksheet.columns = [
      { header: "Full Name", key: "fullName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone Number", key: "phoneNumber", width: 20 },
      // { header: "Country Code", key: "countryCode", width: 10 },
      { header: "Citizenship", key: "citizenship", width: 15 },
      { header: "Residence", key: "residence", width: 15 },
      {
        header: "Preferred Study Level",
        key: "preferredStudyLevel",
        width: 20,
      },
      { header: "Study Destinations", key: "studyDestinations", width: 30 },
      { header: "Academic History", key: "academicHistory", width: 30 },
      { header: "Created At", key: "createdAt", width: 20 },
      { header: "Event Source Name", key: "eventSourceName", width: 25 },
      { header: "Event Source Link", key: "eventSourceLink", width: 30 },
      { header: "event Id", key: "eventId", width: 15 },
      { header: "Referral Code", key: "referralCode", width: 20 },
      { header: "Additional Info", key: "additionalInfo", width: 40 },
    ];

    // Add data rows to the worksheet
    registrations.forEach((registration) => {
      worksheet.addRow({
        fullName: registration.fullName,
        email: registration.email,
        phoneNumber: registration.phoneNumber,
        // countryCode: registration.countryCode,
        citizenship: registration.citizenship,
        residence: registration.residence,
        preferredStudyLevel: registration.preferredStudyLevel,
        studyDestinations: registration.studyDestinations.join(", "),
        academicHistory: JSON.stringify(registration.academicHistory), //eta nia pore kaj korbo. excel a format kora lagbe
        createdAt: registration.createdAt.toLocaleString(), // Include date and time
        eventSourceName: registration.eventSourceName || "",
        eventSourceLink: registration.eventSourceLink || "",
        eventId: registration.eventId || "",
        referralCode: registration.referralCode || "",
        additionalInfo: JSON.stringify(registration.additionalInfo || []),
      });
    });

    // Create dynamic file name including from and to dates
    const fileName = `Expo Registrations from ${new Date(
      from
    ).toLocaleDateString()} to ${new Date(to).toLocaleDateString()}.xlsx`;

    // Set the response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting expo registrations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
