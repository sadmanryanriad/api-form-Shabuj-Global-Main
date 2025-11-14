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
} = require("../controllers/blog");

// Create a blog
router.post("/", createBlog);

// Get all blogs (optionally filter by ?status=publish)
router.get("/", getAllBlogs);

// NEW: Get distinct category list
// GET /blogs/categories
router.get("/categories", getAllCategories);

// NEW: Get blogs by category
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

// Get a blog by its URL (must be after more specific routes)
router.get("/:blogURL", getBlogByURL);

// PATCH request to update a blog (also auto-increments version)
router.patch("/:blogURL", updateBlogByBlogURL);

// Delete blog by URL
router.delete("/:blogURL", deleteBlogByBlogURL);


module.exports = router;
