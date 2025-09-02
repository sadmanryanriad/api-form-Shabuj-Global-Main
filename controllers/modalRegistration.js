const ModalRegistration = require("../models/ModalRegistration");

exports.createRegistration = async (req, res) => {
    try {
        const { name, phone, email, interestedCourse, country } = req.body;

        if (!name || !phone || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newRegistration = new ModalRegistration({ name, phone, email, interestedCourse, country });
        await newRegistration.save();

        res.status(201).json({ message: "Registration successful", data: newRegistration });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const { from, to } = req.query;

    const filter = {};

    // Add createdAt date filter if from/to provided
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // include the whole "to" day
        filter.createdAt.$lte = toDate;
      }
    }

    const registrations = await ModalRegistration.find(filter).select("-__v");

    res.status(200).json({
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
