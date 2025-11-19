const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogByURL,
  checkBlogURL,
  updateBlogByBlogURL,
  deleteBlogByBlogURL,
  getLatestBlogs,
  getBlogsByCategory,
  getAllCategories,
  getAllTrashedBlogs,
  createCategory,
  updateCategory,
  deleteCategory,
  getUsedCategories,
} = require("../controllers/blog");

// Blog CRUD
router.post("/", createBlog);
router.get("/", getAllBlogs);

// Category list (for dropdown / general use)
// GET /blogs/categories
// ALL categories (canonical list)
router.get("/categories", getAllCategories);

// Only categories that are currently used by at least one blog
// GET /blogs/categories/used
router.get("/categories/used", getUsedCategories);

// Category admin operations (Admin-only on frontend side)
// POST /blogs/categories
router.post("/categories", createCategory);
// PATCH /blogs/categories/:id
router.patch("/categories/:id", updateCategory);
// DELETE /blogs/categories/:id or /blogs/categories/:slug
router.delete("/category/:id", deleteCategory);

// Get blogs by category slug
// GET /blogs/category/:category
router.get("/category/:category", getBlogsByCategory);

// Get latest blogs
// GET /blogs/latest/:limit
router.get("/latest/:limit", getLatestBlogs);

// Get all trashed blogs
// GET /blogs/trash
router.get("/trash", getAllTrashedBlogs);

// Check if blogURL is unique
// GET /blogs/check-url/:blogURL
router.get("/check-url/:blogURL", checkBlogURL);

// Get a blog by its URL 
router.get("/:blogURL", getBlogByURL);

// PATCH request to update a blog (also auto-increments version)
router.patch("/:blogURL", updateBlogByBlogURL);

// Delete blog by URL
router.delete("/:blogURL", deleteBlogByBlogURL);

module.exports = router;