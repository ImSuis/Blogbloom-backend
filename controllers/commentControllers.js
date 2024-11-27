const express = require("express");
const Comment = require("../model/commentModel"); // Import Comment model
const Blog = require("../model/blogModel");
const jwt = require("jsonwebtoken");
const { authGuard } = require("../middleware/authGuard"); // Import the authGuard middleware

// Function to add a comment to a blog post
const addCommentToBlog = async (req, res) => {
  try {
    const { content, parentComment } = req.body; // Include parentCommentId in the request body if it's a nested comment
    const { blogId } = req.params;

    // Check if content is provided
    if (!content) {
      console.log("Content is required for comment");
      return res.status(400).json({
        message: "Content is required for comment",
        type: "error",
      });
    }

    // Find the blog post to add the comment to
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        type: "error",
      });
    }

    // Create a new comment
    const newComment = new Comment({
      content,
      user: req.user.id,
      blog: blogId,
      parentComment: parentComment, // Set the parent comment ID if it's a nested comment
    });

    // Save the comment
    await newComment.save();

    // Add the comment to the blog's comments array
    blog.comments.push(newComment._id);
    await blog.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error(`Error adding comment: ${error.message}`);
    res.status(500).json({
      message: "Server Error",
      type: "error",
    });
  }
};

const getCommentsForBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find all comments for the specified blog post
    const comments = await Comment.find({ blog: blogId }).populate("user");

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      comments: comments,
    });
  } catch (error) {
    console.error(`Error fetching comments: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        type: "error",
      });
    }

    // Check if the user is the author of the comment or is an admin
    if (comment.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        message:
          "Permission denied. You are not authorized to delete this comment",
        type: "error",
      });
    }

    // Remove the comment from the database
    await comment.deleteOne();

    res.status(200).json({
      message: "Comment deleted successfully",
      type: "success",
    });
  } catch (error) {
    console.error(`Error deleting comment: ${error.message}`);
    res.status(500).json({
      message: "Server Error",
      type: "error",
    });
  }
};

module.exports = {
  addCommentToBlog,
  getCommentsForBlog,
  deleteComment,
};
