const Enquire = require("../../models/Enquire");

const enquirePatch = async (req, res) => {
  const { id } = req.params;
  const { markAsRead, highlight, newNote, newStatus } = req.body;

  try {
    const updateFields = {};

    // Toggle markAsRead
    if (markAsRead !== undefined) {
      updateFields.markAsRead = markAsRead;
    }

    // Toggle highlight
    if (highlight !== undefined) {
      updateFields.highlight = highlight;
    }

    // Add new note
    if (newNote) {
      updateFields.$push = updateFields.$push || {};
      updateFields.$push.notes = { note: newNote, timestamp: new Date() };
    }

    // Add new status
    if (newStatus) {
      updateFields.$push = updateFields.$push || {};
      updateFields.$push.status = { status: newStatus, timestamp: new Date() };
    }

    const updated = await Enquire.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({ message: "Enquiry updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating enquiry:", error);
    res.status(500).json({ message: "Failed to update enquiry", error });
  }
};

module.exports = enquirePatch;
