const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    // Basic content
    title: { type: String, required: true }, // Title

    // Categories: array of BlogCategory ObjectIds
    categories: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory" }],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "A blog must have at least one category.",
      },
    },

    img: { type: String, required: true }, // Img (main image URL)
    date: { type: Date, default: Date.now }, // Date (publish date)
    author: { type: String, required: true }, // Author
    summary: { type: String, required: true }, // Summary / short description
    tableOfContents: [{ type: String }], // Table of content (array of headings/items)
    mainContent: { type: String, required: true }, // Main content (HTML / rich text)

    video: { type: String }, // Optional video URL
    exploreMoreCategory: { type: [String], default: [] }, // Explore-more tags

    // FAQs
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    // Suggestions
    universityCategoryForSuggestion: { type: String }, // University category for suggestion
    manualCategorySuggestions: { type: [String], default: [] }, // Manual category-based suggestions (string array)

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeyword: { type: String }, // Comma-separated or single keyword string

    // CTA
    ctaUrl: { type: String }, // CTA_URL
    ctaBtn: { type: String }, // CTA_Btn
    isFormHidden: { type: Boolean, default: false }, // For CTA form visibility

    // Status
    status: {
      type: String,
      enum: ["publish", "notPublished"],
      default: "notPublished",
    },

    // URL slug
    blogURL: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-z0-9]+(-[a-z0-9]+)*$/, // lowercase letters, numbers, hyphens
    },

    // Parent–child relationship
    parentBlog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      default: null,
      index: true,
    },
    childOrder: {
      type: Number,
      default: 0,
    },

    // Versioning
    version: {
      type: String,
      default: "1.0", // first version
    },
    versionHistory: [
      {
        version: { type: String, required: true }, // e.g. "1.0", "2.0"
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // createdAt & updatedAt
);

module.exports = mongoose.model("Blog", blogSchema);
