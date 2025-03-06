const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    readTime: { type: String, required: true },
    title: { type: String, required: true },
    writer: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    mainHeadingH1: { type: String, required: true },
    paragraph: { type: String, required: true },
    blogURL: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-z0-9]+(-[a-z0-9]+)*$/, // ✅ Enforcing URL validation
    },
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt
);

module.exports = mongoose.model("Blog", blogSchema);
