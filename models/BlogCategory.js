const mongoose = require("mongoose");

const blogCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-z0-9]+(-[a-z0-9]+)*$/, // lowercase, numbers, hyphens
    },
    description: {
      type: String,
    },
    // For future use if I want system categories like "uncategorized"
    isSystemProtected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlogCategory", blogCategorySchema);
