const ExpoRegistration = require("../models/ExpoRegistration");
const ExcelJS = require("exceljs");
const axios = require("axios");
const archiver = require("archiver");

// POST: Create a new expo registration
exports.createExpoRegistration = async (req, res) => {
  try {
    const {
      recaptchaToken,
      message,
      highlight,
      markAsRead,
      notes,
      ...formData
    } = req.body;
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

    // // Verify reCAPTCHA token
    // try {
    //   const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    //   const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    //   const { data } = await axios.post(
    //     verifyUrl,
    //     new URLSearchParams({
    //       secret: secretKey,
    //       response: recaptchaToken,
    //     })
    //   );

    //   if (!data.success) {
    //     return res
    //       .status(400)
    //       .json({ message: "reCAPTCHA verification failed" });
    //   }
    // } catch (verifyErr) {
    //   console.error("reCAPTCHA error:", verifyErr);
    //   return res.status(500).json({ message: "Error verifying reCAPTCHA" });
    // }

    // Prepare the registration data
    const registrationData = {
      ...formData,
      // Set default values for admin fields
      highlight: false,
      markAsRead: false,
      notes: [],
    };

    // Create and save the new registration
    const newEntry = new ExpoRegistration(registrationData);
    await newEntry.save();

    res
      .status(201)
      .json({ message: "Expo registration saved", data: newEntry });
  } catch (error) {
    console.error("Error saving expo registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET: Fetch expo registrations (with optional filtering)
exports.getExpoRegistrations = async (req, res) => {
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
      page = 1,
      perPage = 20,
      sortBy = "createdAt", // Default sorting by createdAt
      sortOrder = "desc", // Default sorting order: "desc" (newest first)
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
        {
          otherStudyDestination: {
            $regex: new RegExp(`^${studyDestination}$`, "i"),
          },
        },
      ];
    }

    // Highlight filter
    if (highlight !== undefined) {
      // Convert string to boolean
      if (highlight === "true" || highlight === true) {
        filter.highlight = true;
      } else if (highlight === "false" || highlight === false) {
        filter.highlight = false;
      }
    }

    // MarkAsRead filter
    if (markAsRead !== undefined) {
      // Convert string to boolean
      if (markAsRead === "true" || markAsRead === true) {
        filter.markAsRead = true;
      } else if (markAsRead === "false" || markAsRead === false) {
        filter.markAsRead = false;
      }
    }

    // Pagination logic
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(perPage, 10) || 20, 1), 100);

    // Sorting logic
    const sortDir = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    const sortStage = {};
    sortStage[sortBy] = sortDir;

    const [data, total] = await Promise.all([
      ExpoRegistration.find(filter)
        .sort(sortStage) // Apply dynamic sorting
        .skip((pageNum - 1) * pageSize) // Pagination
        .limit(pageSize), // Pagination
      ExpoRegistration.countDocuments(filter), // Total count for pagination
    ]);

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    res.status(200).json({
      total,
      totalPages,
      currentPage: pageNum,
      perPage: pageSize,
      sortBy,
      sortOrder,
      data,
    });
  } catch (error) {
    console.error("Error fetching expo registrations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export Expo Registrations to Excel
exports.exportExpoRegistrations = async (req, res) => {
  try {
    const { from, to, eventSourceLink } = req.query;
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
      { header: "Study Year", key: "studyYear", width: 15 },
      { header: "Study Intake", key: "studyIntake", width: 15 },
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
        studyYear: registration.studyYear || "",
        studyIntake: registration.studyIntake || "",
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

exports.exportByEvent = async (req, res) => {
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

  const registrations = await ExpoRegistration.find(filter).lean();
  const grouped = {};

  registrations.forEach((r) => {
    const key = r.eventSourceLink || "unknown_event";
    grouped[key] = grouped[key] || [];
    grouped[key].push(r);
  });

  //file name set korte
  const fromLabel = from ? new Date(from).toISOString().split("T")[0] : "start";
  const toLabel = to ? new Date(to).toISOString().split("T")[0] : "now";
  const dateLabel = `_from_${fromLabel}_to_${toLabel}`;

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Expo_By_Event${dateLabel}.zip"`
  );

  const archive = archiver("zip");
  archive.pipe(res);

  for (const [event, rows] of Object.entries(grouped)) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Expo Registrations");

    sheet.columns = [
      { header: "Full Name", key: "fullName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone Number", key: "phoneNumber", width: 20 },
      { header: "Citizenship", key: "citizenship", width: 15 },
      { header: "Residence", key: "residence", width: 15 },
      {
        header: "Preferred Study Level",
        key: "preferredStudyLevel",
        width: 20,
      },
      { header: "Study Destinations", key: "studyDestinations", width: 30 },
      { header: "Academic History", key: "academicHistory", width: 30 },
      { header: "Created At", key: "createdAt", width: 25 },
      { header: "Event Source Name", key: "eventSourceName", width: 25 },
      { header: "Event Source Link", key: "eventSourceLink", width: 30 },
      { header: "Event ID", key: "eventId", width: 20 },
      { header: "Referral Code", key: "referralCode", width: 20 },
      { header: "Additional Info", key: "additionalInfo", width: 40 },
      { header: "Study Year", key: "studyYear", width: 15 },
      { header: "Study Intake", key: "studyIntake", width: 15 },
    ];

    rows.forEach((r) => {
      sheet.addRow({
        fullName: r.fullName,
        email: r.email,
        phoneNumber: r.phoneNumber,
        citizenship: r.citizenship,
        residence: r.residence,
        preferredStudyLevel: r.preferredStudyLevel,
        studyDestinations: r.studyDestinations?.join(", ") || "",
        academicHistory: JSON.stringify(r.academicHistory),
        createdAt: new Date(r.createdAt).toLocaleString("en-GB"),
        eventSourceName: r.eventSourceName,
        eventSourceLink: r.eventSourceLink,
        eventId: r.eventId,
        referralCode: r.referralCode,
        additionalInfo: JSON.stringify(r.additionalInfo),
        studyYear: r.studyYear || "",
        studyIntake: r.studyIntake || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    archive.append(buffer, { name: `${event}${dateLabel}.xlsx` });
  }

  await archive.finalize();
};

// PATCH: Update expo registration admin fields (notes, highlight, markAsRead)
exports.updateExpoRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, highlight, markAsRead } = req.body;

    // Find the registration
    const registration = await ExpoRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: "Expo registration not found" });
    }

    // Prepare update object
    const updateData = {};

    // Handle highlight field
    if (typeof highlight === "boolean") {
      updateData.highlight = highlight;
    }

    // Handle markAsRead field
    if (typeof markAsRead === "boolean") {
      updateData.markAsRead = markAsRead;
    }

    // Handle adding new note
    if (note && typeof note === "string" && note.trim().length > 0) {
      updateData.$push = { notes: note.trim() };
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0 && !updateData.$push) {
      return res.status(400).json({
        message:
          "No valid fields to update. Provide highlight, markAsRead, or note.",
      });
    }

    // Update the registration
    const updatedRegistration = await ExpoRegistration.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Expo registration updated successfully",
      data: updatedRegistration,
    });
  } catch (error) {
    console.error("Error updating expo registration:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Invalid registration ID format" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};
