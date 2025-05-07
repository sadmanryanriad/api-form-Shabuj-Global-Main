const ExpoRegistration = require("../models/ExpoRegistration");

// POST: Create a new expo registration
exports.createExpoRegistration = async (req, res) => {
  try {
    const newEntry = new ExpoRegistration(req.body);
    await newEntry.save();
    res.status(201).json({ message: "Expo registration saved", data: newEntry });
  } catch (error) {
    console.error("Error saving expo registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET: Fetch expo registrations (with optional filtering by date range)
//http://localhost:5005/expoRegistration?from=2025-04-20&to=2025-05-08
exports.getExpoRegistrations = async (req, res) => {
    try {
      const { from, to } = req.query;
      const filter = {};
  
      console.log(from, to);
  
      if (from || to) {
        filter.createdAt = {};
  
        if (from) filter.createdAt.$gte = new Date(from);
  
        if (to) {
          const toDate = new Date(to);
          // Set 'to' the end of the day (23:59:59.999)
          toDate.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = toDate;
        }
      }
  
      const data = await ExpoRegistration.find(filter).sort({ createdAt: -1 });
      res.status(200).json({ total: data.length, data });
    } catch (error) {
      console.error("Error fetching expo registrations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
