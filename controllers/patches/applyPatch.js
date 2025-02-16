const Apply = require("../../models/Apply");

const applyPatch = async (req, res) => {
  const { id } = req.params;
  const { markAsRead } = req.body;

  try {
    const updated = await Apply.findByIdAndUpdate(id, { markAsRead }, { new: true });
    if (!updated) return res.status(404).json({ message: "Application not found" });

    res.json({ message: "Application updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update application", error });
  }
};

module.exports = applyPatch;
