const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const BlogTrash = require("../models/BlogTrash");
const BlogCategory = require("../models/BlogCategory");

// CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    let {
      title,
      categories: categorySlugs, // now treated as slugs
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
      video,
      exploreMoreCategory,
    } = req.body;

    // Validate category slugs
    if (!Array.isArray(categorySlugs) || categorySlugs.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one category slug is required" });
    }

    // Normalize slugs: string, trimmed, non-empty
    const normalizedSlugs = categorySlugs
      .map((s) => String(s || "").trim())
      .filter((s) => s.length > 0);

    if (normalizedSlugs.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one valid category slug is required" });
    }

    // Fetch category docs by slug
    const categoryDocs = await BlogCategory.find({
      slug: { $in: normalizedSlugs },
    });

    if (categoryDocs.length !== normalizedSlugs.length) {
      const foundSlugs = categoryDocs.map((c) => c.slug);
      const missingSlugs = normalizedSlugs.filter(
        (s) => !foundSlugs.includes(s)
      );

      return res.status(400).json({
        message: "One or more selected categories are invalid.",
        missingSlugs,
      });
    }

    const categoryIds = categoryDocs.map((c) => c._id);

    // Basic validation
    if (!title || !img || !author || !summary || !mainContent || !blogURL) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Check URL uniqueness
    const blogExists = await Blog.findOne({ blogURL });
    if (blogExists) {
      return res.status(400).json({ message: "Blog URL already exists" });
    }

    const newBlog = new Blog({
      title,
      categories: categoryIds, // store ObjectIds here
      img,
      date,
      author,
      summary,
      tableOfContents,
      mainContent,
      video,
      exploreMoreCategory,
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
    await newBlog.populate("categories", "name slug");

    res.status(201).json({
      message: "Blog created successfully",
      data: newBlog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL BLOGS (optionally filter by status) + PAGINATION
exports.getAllBlogs = async (req, res) => {
  try {
    const { status } = req.query;
    let { page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Normalize page & limit
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.max(parseInt(limit) || 10, 1);
    const skip = (page - 1) * limit;

    // Run count + query in parallel
    const [totalCount, blogs] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(limit)
        .populate("categories", "name slug")
        .select("-__v"),
    ]);

    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    return res.status(200).json({
      meta: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: blogs.length, // current page count (for convenience)
      blogs,
    });
  } catch (error) {
    console.error("Error in getAllBlogs:", error);
    return res.status(500).json({ error: error.message });
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

    // If categories (slugs) are being updated, resolve them to IDs
    if (updates.categories) {
      if (
        !Array.isArray(updates.categories) ||
        updates.categories.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "At least one category slug is required" });
      }

      const normalizedSlugs = updates.categories
        .map((s) => String(s || "").trim())
        .filter((s) => s.length > 0);

      if (normalizedSlugs.length === 0) {
        return res.status(400).json({
          message: "At least one valid category slug is required",
        });
      }

      const categoryDocs = await BlogCategory.find({
        slug: { $in: normalizedSlugs },
      });

      if (categoryDocs.length !== normalizedSlugs.length) {
        const foundSlugs = categoryDocs.map((c) => c.slug);
        const missingSlugs = normalizedSlugs.filter(
          (s) => !foundSlugs.includes(s)
        );

        return res.status(400).json({
          message: "One or more selected categories are invalid.",
          missingSlugs,
        });
      }

      const categoryIds = categoryDocs.map((c) => c._id);

      // override updates.categories with IDs so the rest of the code works
      updates.categories = categoryIds;
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
    await blog.populate("categories", "name slug");

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

// GET BLOGS BY CATEGORY (slug OR ObjectId) + PAGINATION
exports.getBlogsByCategory = async (req, res) => {
  try {
    const { category: identifier } = req.params; // slug or id
    let { page = 1, limit = 10 } = req.query;

    if (!identifier) {
      return res
        .status(400)
        .json({ message: "Category identifier is required" });
    }

    let categoryDoc = null;

    // Try by ObjectId first if looks valid
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      categoryDoc = await BlogCategory.findById(identifier);
    }

    // If not found by id, try by slug
    if (!categoryDoc) {
      categoryDoc = await BlogCategory.findOne({ slug: identifier });
    }

    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Normalize pagination
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.max(parseInt(limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { categories: categoryDoc._id };

    const [totalCount, blogs] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("categories", "name slug")
        .select("-__v"),
    ]);

    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    return res.status(200).json({
      category: {
        _id: categoryDoc._id,
        name: categoryDoc.name,
        slug: categoryDoc.slug,
      },
      meta: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("Error in getBlogsByCategory:", error);
    return res.status(500).json({ error: error.message });
  }
};


// GET ALL DEFINED CATEGORIES (canonical list)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find()
      .sort({ name: 1 })
      .select("name slug description isSystemProtected createdAt updatedAt");

    res.status(200).json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ONLY CATEGORIES THAT ARE USED IN AT LEAST ONE BLOG + BLOG COUNT
exports.getUsedCategories = async (req, res) => {
  try {
    // Aggregate blog counts per category
    const counts = await Blog.aggregate([
      { $unwind: "$categories" }, // each category entry
      { $group: { _id: "$categories", blogCount: { $sum: 1 } } }, // count blogs per categoryId
    ]);

    if (!counts.length) {
      return res.status(200).json({
        count: 0,
        categories: [],
      });
    }

    // Extract category IDs from aggregation
    const categoryIds = counts.map((item) => item._id);

    // Fetch category documents
    const categories = await BlogCategory.find({ _id: { $in: categoryIds } })
      .sort({ name: 1 })
      .select("name slug description");

    // Map: categoryId -> blogCount
    const countMap = counts.reduce((acc, item) => {
      acc[item._id.toString()] = item.blogCount;
      return acc;
    }, {});

    // Build response array with blogCount per category
    const result = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      blogCount: countMap[cat._id.toString()] || 0,
    }));

    res.status(200).json({
      count: result.length,
      categories: result,
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
    const trashedBlogs = await BlogTrash.find()
      .sort({ deletedAt: -1 })
      .select("-__v");

    res.status(200).json({
      count: trashedBlogs.length,
      blogs: trashedBlogs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//
// 🔹 CATEGORY ADMIN CONTROLLERS
//

// CREATE CATEGORY (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res
        .status(400)
        .json({ message: "Name and slug are required for category" });
    }

    const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
    if (!isValidSlug) {
      return res.status(400).json({
        message:
          "Invalid slug format. Use lowercase letters, numbers (0-9), and hyphens.",
      });
    }

    const existing = await BlogCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Category slug already exists" });
    }

    const category = new BlogCategory({
      name,
      slug,
      description,
      // isSystemProtected: false by default
    });

    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE CATEGORY (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const category = await BlogCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.isSystemProtected) {
      // Optionally restrict editing slug/name for system categories
      if (slug && slug !== category.slug) {
        return res.status(400).json({
          message: "Cannot change slug of a system-protected category",
        });
      }
    }

    if (name) category.name = name;

    if (slug && slug !== category.slug) {
      const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
      if (!isValidSlug) {
        return res.status(400).json({
          message:
            "Invalid slug format. Use lowercase letters, numbers (0-9), and hyphens.",
        });
      }

      const existing = await BlogCategory.findOne({ slug });
      if (existing && existing._id.toString() !== category._id.toString()) {
        return res
          .status(400)
          .json({ message: "Category slug already exists" });
      }

      category.slug = slug;
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE CATEGORY (accepts slug OR ObjectId) with safety checks
exports.deleteCategory = async (req, res) => {
  try {
    const { id: identifier } = req.params; // can be slug or id

    let category = null;

    // Try by ObjectId first if valid
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      category = await BlogCategory.findById(identifier);
    }

    // If not found or not a valid ObjectId, try by slug
    if (!category) {
      category = await BlogCategory.findOne({ slug: identifier });
    }

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.isSystemProtected) {
      return res
        .status(400)
        .json({ message: "Cannot delete a system-protected category" });
    }

    // Find all blogs using this category
    const blogsUsingCategory = await Blog.find({
      categories: category._id,
    }).select("title blogURL categories");

    // Blogs for which this is the ONLY category
    const blockingBlogs = blogsUsingCategory.filter(
      (b) => Array.isArray(b.categories) && b.categories.length === 1
    );

    if (blockingBlogs.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category because some blogs use it as their only category.",
        blockingBlogs: blockingBlogs.map((b) => ({
          _id: b._id,
          title: b.title,
          blogURL: b.blogURL,
        })),
      });
    }

    // Must keep at least 1 category rule
    const otherCategoriesCount = await BlogCategory.countDocuments({
      _id: { $ne: category._id },
    });

    if (otherCategoriesCount === 0) {
      return res.status(400).json({
        message: "You must keep at least 1 category.",
      });
    }

    // Safe: remove this category from all blogs (they have other categories)
    await Blog.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );

    // Finally delete the category
    await BlogCategory.deleteOne({ _id: category._id });

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return res.status(500).json({ error: error.message });
  }
};
