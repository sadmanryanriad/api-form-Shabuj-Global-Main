const Blog = require("../models/Blog");

exports.createBlog = async (req, res) => {
    try {
        const { readTime, title, writer, image, description, category, mainHeadingH1, paragraph, blogURL } = req.body;

        if (!readTime || !title || !writer || !image || !description || !category || !mainHeadingH1 || !paragraph || !blogURL) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const blogExists = await Blog.findOne({ blogURL });
        if (blogExists) {
            return res.status(400).json({ message: "Blog URL already exists" });
        }

        const newBlog = new Blog({ readTime, title, writer, image, description, category, mainHeadingH1, paragraph, blogURL });
        await newBlog.save();

        res.status(201).json({ message: "Blog created successfully", data: newBlog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().select("-__v");
        res.status(200).json({ count: blogs.length, blogs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBlogByURL = async (req, res) => {
    try {
        const blog = await Blog.findOne({ blogURL: req.params.blogURL }).select("-__v");

        if (!blog) return res.status(404).json({ message: "Blog not found" });

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkBlogURL = async (req, res) => {
    try {
        const { blogURL } = req.params;

        // Validate blogURL format
        const isValid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(blogURL);
        if (!isValid) {
            return res.status(400).json({ 
                isUnique: false, 
                message: "Invalid blog URL format. Use lowercase letters, numbers (0-9), and hyphens." 
            });
        }

        // Check uniqueness in DB
        const blogExists = await Blog.findOne({ blogURL });

        if (blogExists) {
            return res.status(400).json({ 
                isUnique: false, 
                message: "Blog URL already exists" 
            });
        }

        res.status(200).json({ 
            isUnique: true, 
            message: "Blog URL is available" 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBlogByBlogURL = async (req, res) => {
    try {
        const { blogURL } = req.params;
        const updates = req.body;

        // Check if the blog exists
        const blog = await Blog.findOne({ blogURL });
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // If blogURL is being updated, validate it
        if (updates.blogURL) {
            const isValid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(updates.blogURL);
            if (!isValid) {
                return res.status(400).json({ 
                    message: "Invalid blog URL format. Use lowercase letters, numbers (0-9), and hyphens." 
                });
            }

            // Check if the new blogURL is already taken
            const existingBlog = await Blog.findOne({ blogURL: updates.blogURL });
            if (existingBlog && existingBlog._id.toString() !== blog._id.toString()) {
                return res.status(400).json({ message: "Blog URL already exists" });
            }
        }

        // Update the blog with new data
        const updatedBlog = await Blog.findOneAndUpdate({ blogURL }, updates, { new: true });

        res.status(200).json({
            message: "Blog updated successfully",
            updatedBlog
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBlogByBlogURL = async (req, res) => {
    try {
        const { blogURL } = req.params;

        // Find the blog by blogURL
        const blog = await Blog.findOneAndDelete({ blogURL });

        // If the blog is not found, return a 404 error
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json({
            message: "Blog deleted successfully",
            blogURL: blog.blogURL,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch Latest Blogs (sorted by creation date, limit optional)
exports.getLatestBlogs = async (req, res) => {
    try {
        const limit = parseInt(req.params.limit) || 10; // Default limit: 10
        const blogs = await Blog.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(limit)
            .select("-__v");

        res.status(200).json({ count: blogs.length, blogs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


