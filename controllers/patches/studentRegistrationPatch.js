const StudentRegistration = require("../../models/StudentRegistration");

const studentRegistrationPatch = async (req, res) => {
  const { id } = req.params;
  const { markAsRead, note } = req.body;

  try {
    const updated = await StudentRegistration.findByIdAndUpdate(id, { markAsRead, note }, { new: true });
    if (!updated) return res.status(404).json({ message: "Student registration not found" });

    res.json({ message: "Student registration updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update student registration", error });
  }
};

module.exports = studentRegistrationPatch;
