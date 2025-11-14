const mongoose = require("mongoose");

const blogTrashSchema = new mongoose.Schema(
  {
    // keep everything flexible here to mirror Blog documents easily
    originalId: { type: mongoose.Schema.Types.ObjectId, required: true }, // _id from Blog
    deletedAt: { type: Date, default: Date.now },

    // The rest of the fields will be copied from the Blog doc
  },
  { strict: false, timestamps: true } // strict: false lets us store any Blog fields
);

module.exports = mongoose.model("BlogTrash", blogTrashSchema);
