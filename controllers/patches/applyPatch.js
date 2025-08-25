const Apply = require("../../models/Apply");

const applyPatch = async (req, res) => {
  const { id } = req.params;
  const { markAsRead, isHighlight, newNote, newStatus } = req.body;

  try {
    const updateFields = {};

    // markAsRead (accept boolean or "true"/"false")
    if (markAsRead !== undefined) {
      const parsedMarkAsRead =
        typeof markAsRead === "string"
          ? markAsRead.toLowerCase() === "true"
          : Boolean(markAsRead);
      updateFields.markAsRead = parsedMarkAsRead;
    }

    // isHighlight (accept boolean or "true"/"false")
    if (isHighlight !== undefined) {
      const parsedIsHighlight =
        typeof isHighlight === "string"
          ? isHighlight.toLowerCase() === "true"
          : Boolean(isHighlight);
      updateFields.isHighlight = parsedIsHighlight;
    }

    if (newNote) {
      updateFields.$push = updateFields.$push || {};
      updateFields.$push.notes = { note: newNote, timestamp: new Date() };
    }

    if (newStatus) {
      updateFields.$push = updateFields.$push || {};
      updateFields.$push.status = { status: newStatus, timestamp: new Date() };
    }

    const updated = await Apply.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) return res.status(404).json({ message: "Application not found" });

    res.json({ message: "Application updated successfully", data: updated });
  } catch (error) {
    console.error("Failed to update application", error);
    res.status(500).json({ message: "Failed to update application", error });
  }
};

module.exports = applyPatch;
