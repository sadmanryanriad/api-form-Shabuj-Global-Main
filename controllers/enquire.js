const Enquire = require('../models/Enquire');

const enquire = async (req, res) => {
  const { subject, email, message } = req.body;

  try {
    // Create a new enquire document
    const newEnquire = new Enquire({
      subject,
      email,
      message,
    });
    await newEnquire.save();
    res.send("Enquire stored successfully!");
  } catch (err) {
    res.status(500).send("Error saving the enquire: " + err.message);
  }
};

module.exports = enquire;
