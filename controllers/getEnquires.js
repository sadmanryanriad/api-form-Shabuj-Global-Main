const Enquire = require("../models/Enquire");

const getEnquires = async (req, res) => {
  try {
    const enquiries = await Enquire.find();
    const total = enquiries.length;
    res.status(200).json({ total, enquiries });
  } catch (error) {
    console.error("Error fetching enquiries: ", error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
};

module.exports = getEnquires;