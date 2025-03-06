const express = require("express");
const router = express.Router();
const { createBlog, getAllBlogs, getBlogByURL, checkBlogURL, updateBlogByBlogURL, deleteBlogByBlogURL, getLatestBlogs, getBlogsByCategory } = require("../controllers/blog");

router.post("/", createBlog);  // Create a blog
router.get("/", getAllBlogs);  // Get all blogs
router.get("/:blogURL", getBlogByURL);  // Get a blog by its URL
router.get("/check-url/:blogURL", checkBlogURL); // Check if blogURL is unique
router.patch("/:blogURL", updateBlogByBlogURL);// PATCH request to update a blog
router.delete("/:blogURL", deleteBlogByBlogURL);
router.get("/latest/:limit", getLatestBlogs);  // Fetch latest blogs

module.exports = router;
