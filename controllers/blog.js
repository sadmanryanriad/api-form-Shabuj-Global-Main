const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const BlogTrash = require("../models/BlogTrash");
const BlogCategory = require("../models/BlogCategory");

// CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    let {
      title,
      categories: categorySlugs, // slugs from frontend
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
      faqs,
      // parent–child
      parentBlogURL, // (optional)
    } = req.body;

    // --- Category validation (by slug) ---
    if (!Array.isArray(categorySlugs) || categorySlugs.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one category slug is required" });
    }

    const normalizedSlugs = categorySlugs
      .map((s) => String(s || "").trim())
      .filter((s) => s.length > 0);

    if (normalizedSlugs.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one valid category slug is required" });
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

    // --- Basic validation ---
    if (!title || !img || !author || !summary || !mainContent || !blogURL) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // --- Unique blogURL check ---
    const blogExists = await Blog.findOne({ blogURL });
    if (blogExists) {
      return res.status(400).json({ message: "Blog URL already exists" });
    }

    // --- Resolve parentBlogId from parentBlogURL (optional) ---
    let parentBlogId = null;
    if (parentBlogURL) {
      const parent = await Blog.findOne({ blogURL: parentBlogURL }).select(
        "_id"
      );

      if (!parent) {
        return res.status(400).json({
          message: "Parent blog not found for the given parentBlogURL",
        });
      }

      parentBlogId = parent._id;
    }

    // --- Auto-assign childOrder on server ---
    let childOrderValue = 0;
    if (parentBlogId) {
      const lastChild = await Blog.find({ parentBlog: parentBlogId })
        .sort({ childOrder: -1 })
        .limit(1)
        .select("childOrder");

      if (lastChild.length > 0) {
        childOrderValue = (lastChild[0].childOrder || 0) + 1;
      } else {
        childOrderValue = 1; // first child
      }
    }

    const newBlog = new Blog({
      title,
      categories: categoryIds,
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
      faqs: Array.isArray(faqs) ? faqs : [],

      // parent–child
      parentBlog: parentBlogId,
      childOrder: childOrderValue,

      // versioning
      version: "1.0",
      versionHistory: [{ version: "1.0", updatedAt: new Date() }],
    });

    await newBlog.save();

    // Populate categories + parentBlog for the response
    await newBlog.populate([
      { path: "categories", select: "name slug description" },
      { path: "parentBlog", select: "title blogURL" },
    ]);

    return res.status(201).json({
      message: "Blog created successfully",
      data: newBlog,
    });
  } catch (error) {
    console.error("Error in createBlog:", error);
    return res.status(500).json({ error: error.message });
  }
};

// GET ALL BLOGS (optionally filter by status) + PAGINATION + ROOT/CHILD FILTERS + ANCESTORS
exports.getAllBlogs = async (req, res) => {
  try {
    const { status, onlyRoots, onlyChildren } = req.query;
    let { page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Optional filters:
    // onlyRoots=true    -> parentBlog = null
    // onlyChildren=true -> parentBlog != null
    if (onlyRoots === "true") {
      filter.parentBlog = null;
    } else if (onlyChildren === "true") {
      filter.parentBlog = { $ne: null };
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
        .populate([
          { path: "categories", select: "name slug description" },
          { path: "parentBlog", select: "title blogURL parentBlog" },
        ])
        .select("-__v"),
    ]);

    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    // Build ancestors array for each blog
    const blogsWithAncestors = [];

    for (const blog of blogs) {
      const blogObj = blog.toObject(); // plain JS object for safe mutation
      const ancestors = [];

      // Start from the immediate parent (already populated by query)
      let currentParent = blog.parentBlog;

      while (currentParent) {
        let parentDoc;

        // If populated document
        if (typeof currentParent === "object" && currentParent._id) {
          parentDoc = currentParent;
        } else {
          // Fallback: fetch by id (for deeper ancestors)
          parentDoc = await Blog.findById(currentParent).select(
            "title blogURL parentBlog"
          );
        }

        if (!parentDoc) break;

        // Add to start so array is [root, ..., directParent]
        ancestors.unshift({
          _id: parentDoc._id,
          title: parentDoc.title,
          blogURL: parentDoc.blogURL,
        });

        currentParent = parentDoc.parentBlog;
      }

      blogObj.ancestors = ancestors;
      blogsWithAncestors.push(blogObj);
    }

    return res.status(200).json({
      meta: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: blogsWithAncestors.length,
      blogs: blogsWithAncestors,
    });
  } catch (error) {
    console.error("Error in getAllBlogs:", error);
    return res.status(500).json({ error: error.message });
  }
};

// GET BLOG BY URL (with parent, ancestors & children)
exports.getBlogByURL = async (req, res) => {
  try {
    const { blogURL } = req.params;

    const blog = await Blog.findOne({ blogURL })
      .populate("categories", "name slug description")
      .populate("parentBlog", "title blogURL")
      .select("-__v");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const blogObj = blog.toObject();

    // Build ancestors chain (root -> ... -> immediate parent)
    const ancestors = [];
    let currentParentId = blog.parentBlog ? blog.parentBlog._id : null;
    const visited = new Set();
    let depth = 0;
    const MAX_DEPTH = 10; // safety to avoid loops

    while (
      currentParentId &&
      depth < MAX_DEPTH &&
      !visited.has(currentParentId.toString())
    ) {
      visited.add(currentParentId.toString());
      const parentDoc = await Blog.findById(currentParentId).select(
        "title blogURL parentBlog"
      );

      if (!parentDoc) break;

      ancestors.unshift({
        _id: parentDoc._id,
        title: parentDoc.title,
        blogURL: parentDoc.blogURL,
      });

      currentParentId = parentDoc.parentBlog;
      depth++;
    }

    // Find direct children
    const children = await Blog.find({ parentBlog: blog._id })
      .sort({ childOrder: 1, createdAt: 1 })
      .select("title blogURL childOrder status createdAt");

    blogObj.ancestors = ancestors; // for breadcrumb
    blogObj.children = children; // for series navigation

    return res.status(200).json(blogObj);
  } catch (error) {
    console.error("Error in getBlogByURL:", error);
    return res.status(500).json({ error: error.message });
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

// UPDATE BLOG BY blogURL + AUTO VERSION INCREMENT + PARENT HANDLING
exports.updateBlogByBlogURL = async (req, res) => {
  try {
    const { blogURL } = req.params;
    const updates = { ...req.body }; // shallow copy to safely delete keys

    // Find existing blog
    const blog = await Blog.findOne({ blogURL });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // --- Prevent direct parentBlog overwrites from client (string -> ObjectId cast issue) ---
    if ("parentBlog" in updates) {
      delete updates.parentBlog;
    }

    // --- Handle blogURL change (slug) ---
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

    // --- Handle categories (slugs -> ObjectIds) if provided ---
    if (updates.categories) {
      if (!Array.isArray(updates.categories) || updates.categories.length === 0) {
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
      updates.categories = categoryIds; // store ObjectIds
    }

    // --- Handle parentBlog via parentBlogURL (string from frontend) ---
    if (Object.prototype.hasOwnProperty.call(updates, "parentBlogURL")) {
      const parentBlogURL = updates.parentBlogURL;

      if (!parentBlogURL) {
        // Detach from parent -> make this a root blog
        blog.parentBlog = null;
        blog.childOrder = 0;
      } else {
        // Find parent blog by its URL
        const parent = await Blog.findOne({ blogURL: parentBlogURL }).select("_id");

        if (!parent) {
          return res.status(400).json({
            message: "Parent blog not found for the given parentBlogURL",
          });
        }

        // Safety: avoid self-parent
        if (parent._id.toString() === blog._id.toString()) {
          return res.status(400).json({
            message: "A blog cannot be its own parent",
          });
        }

        // Assign new parent
        blog.parentBlog = parent._id;

        // Auto-assign childOrder for this parent (ignore this blog itself if moving)
        const lastChild = await Blog.find({
          parentBlog: parent._id,
          _id: { $ne: blog._id },
        })
          .sort({ childOrder: -1 })
          .limit(1)
          .select("childOrder");

        const nextChildOrder =
          lastChild.length > 0 ? (lastChild[0].childOrder || 0) + 1 : 1;

        blog.childOrder = nextChildOrder;
      }

      // Don't try to set parentBlogURL as a field on the document
      delete updates.parentBlogURL;
    }

    // --- Versioning ---
    const currentVersion = parseFloat(blog.version || "1.0") || 1.0;

    blog.versionHistory.push({
      version: blog.version || "1.0",
      updatedAt: new Date(),
    });

    const nextVersion = (currentVersion + 1).toFixed(1); // 1.0 -> 2.0 -> 3.0 etc.
    blog.version = nextVersion;

    // --- Apply remaining updates (safe fields only) ---
    Object.keys(updates).forEach((key) => {
      // we already handled parentBlog / parentBlogURL above
      if (["parentBlog", "parentBlogURL"].includes(key)) return;

      // optionally, if I don't want UI to overwrite childOrder manually yet:
      // if (key === "childOrder") return;

      blog[key] = updates[key];
    });

    await blog.save();

    // Populate relations for response
    await blog.populate([
      { path: "categories", select: "name slug description" },
      { path: "parentBlog", select: "title blogURL" },
    ]);

    return res.status(200).json({
      message: "Blog updated successfully",
      updatedBlog: blog,
    });
  } catch (error) {
    console.error("Error in updateBlogByBlogURL:", error);
    return res.status(500).json({ error: error.message });
  }
};

// FETCH LATEST BLOGS
exports.getLatestBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(limit)
      .populate("categories", "name slug description")
      .select("-__v");

    res.status(200).json({ count: blogs.length, blogs });
  } catch (error) {
    console.error("Error in getLatestBlogs:", error);
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
        .populate("categories", "name slug description")
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

// DELETE BLOG BY blogURL (move to trash, but block if it has children)
exports.deleteBlogByBlogURL = async (req, res) => {
  try {
    const { blogURL } = req.params;

    // Find blog first (we don't want to delete before copying)
    const blog = await Blog.findOne({ blogURL });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if this blog has children
    const children = await Blog.find({ parentBlog: blog._id }).select(
      "title blogURL"
    );

    if (children.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete this blog because it has child blogs. Reassign or detach children first.",
        children: children.map((c) => ({
          _id: c._id,
          title: c.title,
          blogURL: c.blogURL,
        })),
      });
    }

    // Store in trash collection
    await BlogTrash.create({
      originalId: blog._id,
      deletedAt: new Date(),
      ...blog.toObject(), // copy all fields (including parentBlog)
    });

    // Now delete from main Blog collection
    await Blog.deleteOne({ _id: blog._id });

    res.status(200).json({
      message: "Blog moved to trash successfully",
      blogURL: blog.blogURL,
    });
  } catch (error) {
    console.error("Error in deleteBlogByBlogURL:", error);
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

// CHECK CATEGORY SLUG AVAILABILITY
// GET /blogs/categories/check-slug/:slug
exports.checkCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Basic format validation (same style as blogURL)
    const isValid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
    if (!isValid) {
      return res.status(400).json({
        isUnique: false,
        message:
          "Invalid category slug format. Use lowercase letters, numbers (0-9), and hyphens.",
      });
    }

    // Check if slug already exists in BlogCategory collection
    const existingCategory = await BlogCategory.findOne({ slug });

    if (existingCategory) {
      return res.status(200).json({
        isUnique: false,
        message: "Category slug already exists.",
        category: {
          _id: existingCategory._id,
          name: existingCategory.name,
          slug: existingCategory.slug,
        },
      });
    }

    // Slug is valid and not used
    return res.status(200).json({
      isUnique: true,
      message: "Category slug is available.",
    });
  } catch (error) {
    console.error("Error in checkCategorySlug:", error);
    return res.status(500).json({ error: error.message });
  }
};
