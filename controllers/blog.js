const Blog = require("../models/Blog");
const BlogTrash = require("../models/BlogTrash");

// CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    let {
      title,
      category,
      img,
      date,
      author,
      summary,
      tableOfContents,
      mainContent,
      universityCategoryForSuggestion,
      manualCategorySuggestions,
      metaTitle,
      metaDescription,
      metaKeyword,
      ctaUrl,
      ctaBtn,
      isFormHidden,
      status,
      blogURL,
    } = req.body;

    // Normalize category to array
    let categoryArray;
    if (Array.isArray(category)) {
      categoryArray = category;
    } else if (typeof category === "string" && category.trim() !== "") {
      categoryArray = [category.trim()];
    } else {
      return res
        .status(400)
        .json({ message: "Category is required and must be a string or array of strings" });
    }

    // Basic validation
    if (
      !title ||
      !img ||
      !author ||
      !summary ||
      !mainContent ||
      !blogURL
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Check URL uniqueness
    const blogExists = await Blog.findOne({ blogURL });
    if (blogExists) {
      return res.status(400).json({ message: "Blog URL already exists" });
    }

    const newBlog = new Blog({
      title,
      category: categoryArray, // ✅ store as array
      img,
      date,
      author,
      summary,
      tableOfContents,
      mainContent,
      universityCategoryForSuggestion,
      manualCategorySuggestions,
      metaTitle,
      metaDescription,
      metaKeyword,
      ctaUrl,
      ctaBtn,
      isFormHidden,
      status,
      blogURL,
      version: "1.0",
      versionHistory: [{ version: "1.0", updatedAt: new Date() }],
    });

    await newBlog.save();

    res.status(201).json({
      message: "Blog created successfully",
      data: newBlog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET ALL BLOGS (optionally filter by status)
exports.getAllBlogs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const blogs = await Blog.find(filter).select("-__v");
    res.status(200).json({ count: blogs.length, blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BLOG BY URL
exports.getBlogByURL = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      blogURL: req.params.blogURL,
    }).select("-__v");

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CHECK BLOG URL AVAILABILITY
exports.checkBlogURL = async (req, res) => {
  try {
    const { blogURL } = req.params;

    const isValid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(blogURL);
    if (!isValid) {
      return res.status(400).json({
        isUnique: false,
        message:
          "Invalid blog URL format. Use lowercase letters, numbers (0-9), and hyphens.",
      });
    }

    const blogExists = await Blog.findOne({ blogURL });

    if (blogExists) {
      return res.status(400).json({
        isUnique: false,
        message: "Blog URL already exists",
      });
    }

    res.status(200).json({
      isUnique: true,
      message: "Blog URL is available",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE BLOG BY blogURL + AUTO VERSION INCREMENT
exports.updateBlogByBlogURL = async (req, res) => {
  try {
    const { blogURL } = req.params;
    const updates = req.body;

    // Find existing blog
    const blog = await Blog.findOne({ blogURL });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // If blogURL is being updated, validate & ensure uniqueness
    if (updates.blogURL && updates.blogURL !== blog.blogURL) {
      const isValid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(updates.blogURL);
      if (!isValid) {
        return res.status(400).json({
          message:
            "Invalid blog URL format. Use lowercase letters, numbers (0-9), and hyphens.",
        });
      }

      const existingBlog = await Blog.findOne({ blogURL: updates.blogURL });
      if (existingBlog && existingBlog._id.toString() !== blog._id.toString()) {
        return res.status(400).json({ message: "Blog URL already exists" });
      }
    }

    // Versioning: push current version into history, then increment
    const currentVersion = parseFloat(blog.version || "1.0") || 1.0;

    blog.versionHistory.push({
      version: blog.version || "1.0",
      updatedAt: new Date(),
    });

    const nextVersion = (currentVersion + 1).toFixed(1); // 1.0 -> 2.0 -> 3.0 etc.
    blog.version = nextVersion;

    // Apply updates to blog document
    Object.keys(updates).forEach((key) => {
      blog[key] = updates[key];
    });

    await blog.save();

    res.status(200).json({
      message: "Blog updated successfully",
      updatedBlog: blog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FETCH LATEST BLOGS
exports.getLatestBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const blogs = await Blog.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(limit)
      .select("-__v");

    res.status(200).json({ count: blogs.length, blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BLOGS BY CATEGORY 
exports.getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Match blogs where category array contains this value
    const blogs = await Blog.find({ category: { $in: [category] } })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({ count: blogs.length, blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET DISTINCT CATEGORY LIST 
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct("category"); // each unique tag
    res.status(200).json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DELETE BLOG BY blogURL (move to trash)
exports.deleteBlogByBlogURL = async (req, res) => {
  try {
    const { blogURL } = req.params;

    // Find blog first (we don't want to delete before copying)
    const blog = await Blog.findOne({ blogURL });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Store in trash collection
    await BlogTrash.create({
      originalId: blog._id,
      deletedAt: new Date(),
      ...blog.toObject(), // copy all fields
    });

    // Now delete from main Blog collection
    await Blog.deleteOne({ _id: blog._id });

    res.status(200).json({
      message: "Blog moved to trash successfully",
      blogURL: blog.blogURL,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// GET ALL TRASHED BLOGS
exports.getAllTrashedBlogs = async (req, res) => {
  try {
    const trashedBlogs = await BlogTrash.find().sort({ deletedAt: -1 }).select("-__v");

    res.status(200).json({
      count: trashedBlogs.length,
      blogs: trashedBlogs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};