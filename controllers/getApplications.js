const Apply = require("../models/Apply");

const getApplications = async (req, res) => {
  try {
    const applications = await Apply.find();
    const total = applications.length;
    res.status(200).json({ total, applications });
  } catch (error) {
    console.error("Error fetching applications: ", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

module.exports = getApplications;