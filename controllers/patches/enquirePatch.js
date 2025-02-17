const Enquire = require("../../models/Enquire");

const enquirePatch = async (req, res) => {
  const { id } = req.params;
  const { markAsRead, newNote, newStatus } = req.body;

  try {
    const updateFields = {};

    if (markAsRead !== undefined) {
      updateFields.markAsRead = markAsRead;
    }

    if (newNote) {
      updateFields.$push = updateFields.$push || {};
      updateFields.$push.notes = { note: newNote, timestamp: new Date() };
    }

    if (newStatus) {
      updateFields.$push = updateFields.$push || {};
      updateFields.$push.status = { status: newStatus, timestamp: new Date() };
    }

    const updated = await Enquire.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) return res.status(404).json({ message: "Enquiry not found" });

    res.json({ message: "Enquiry updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update enquiry", error });
  }
};

module.exports = enquirePatch;
