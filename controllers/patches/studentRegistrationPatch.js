const StudentRegistration = require("../../models/StudentRegistration");

const studentRegistrationPatch = async (req, res) => {
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

    const updated = await StudentRegistration.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Student registration not found" });
    }

    res.json({
      message: "Student registration updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update student registration", error });
  }
};

module.exports = studentRegistrationPatch;
