const express = require("express");
const Blog = require("../model/blogModel");

const cloudinary = require("cloudinary");
const blogModel = require("../model/blogModel");

const createBlog = async (req, res) => {
  console.log("Received request to create blog");
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

  try {
    const { title, content } = req.body;
    const { blogImage } = req.files;

    // Check if title and content are provided
    if (!title || !content) {
      console.log("Title and content are required");
      return res.status(400).json({
        message: "Title and content are required",
        type: "error",
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await cloudinary.v2.uploader.upload(blogImage.path, {
      folder: "blogs",
      crop: "scale", // Fixed typo in 'corp'
    });

    // Create a new blog post with user ID from req.user
    const newBlog = new Blog({
      title,
      content,
      user: req.user.id,
      blogImageUrl: uploadedImage.secure_url,
    });

    console.log("Creating blog with user ID:", req.user.id);

    // Save the new blog post
    await newBlog.save();

    console.log("Blog created successfully:", newBlog);

    res.status(201).json(newBlog);
  } catch (error) {
    console.error(`Error creating blog: ${error.message}`);
    res.status(500).json({
      message: error.message,
      type: "error",
    });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    // Fetch blogs and populate the 'user' field, sorted by creation date in descending order
    const listOfBlogs = await Blog.find()
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Blogs fetched successfully",
      blogs: listOfBlogs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server Error");
  }
};

const getSingleBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find the single blog post by ID
    const blog = await Blog.findById(blogId).populate("user");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog fetched successfully",
      blog: blog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server Error");
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find the blog by ID
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check if the logged-in user is authorized to delete the blog
    if (blog.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this blog",
      });
    }

    // Delete the blog
    await blog.deleteOne();

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting blog: ${error.message}`);
    res.status(500).json({
      message: "Server Error",
      type: "error",
    });
  }
};

const editBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content } = req.body;
    const { blogImage } = req.files;

    // Find the blog by ID
    let blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check if the logged-in user is authorized to edit the blog
    if (blog.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this blog",
      });
    }

    // Update the blog title and content
    blog.title = title || blog.title;
    blog.content = content || blog.content;

    // Check if a new image is provided
    if (blogImage) {
      // Upload the new image to cloudinary
      const uploadedImage = await cloudinary.v2.uploader.upload(
        blogImage.path,
        {
          folder: "blogs",
          corp: "scale",
        }
      );

      // Update the blog image URL
      blog.blogImageUrl = uploadedImage.secure_url;
    }

    // Save the updated blog
    blog = await blog.save();

    res.json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error(`Error editing blog: ${error.message}`);
    res.status(500).json({
      message: "Server Error",
      type: "error",
    });
  }
};

const getPagination = async (req, res) => {
  // Get page number from frontend query parameter
  const requestedPage = req.query.page;

  // Set limit
  const resultPerPage = 7;

  try {
    const blogs = await blogModel
      .find({})
      .populate("user") // Populate the 'user' field
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .skip((requestedPage - 1) * resultPerPage)
      .limit(resultPerPage);

    if (blogs.length === 0) {
      return res.json({
        success: false,
        message: "No Blogs Found",
      });
    }

    res.json({
      success: true,
      blogs: blogs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const searchBlogByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    // Perform case-insensitive search for blogs containing the given title
    const blogs = await Blog.find({
      title: { $regex: title, $options: "i" },
    }).populate("user");

    if (blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found with the given title",
      });
    }

    res.json({
      success: true,
      message: "Blogs fetched successfully",
      blogs: blogs,
    });
  } catch (error) {
    console.error(`Error searching blogs by title: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  deleteBlog,
  editBlog,
  getPagination,
  searchBlogByTitle,
};
