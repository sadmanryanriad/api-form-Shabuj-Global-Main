const Enquire = require("../../models/Enquire");

const enquirePatch = async (req, res) => {
  const { id } = req.params;
  const { markAsRead } = req.body;

  try {
    const updated = await Enquire.findByIdAndUpdate(id, { markAsRead }, { new: true });
    if (!updated) return res.status(404).json({ message: "Enquiry not found" });

    res.json({ message: "Enquiry updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update enquiry", error });
  }
};

module.exports = enquirePatch;
