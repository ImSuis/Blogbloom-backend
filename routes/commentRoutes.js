const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentControllers");
const { authGuard } = require("../middleware/authGuard"); // Import authGuard middleware

// Create Comment API endpoint with authGuard middleware
router.post(
  "/create-comment/:blogId",
  authGuard,
  commentController.addCommentToBlog
);
router.get("/get-comment/:blogId", commentController.getCommentsForBlog);

// DELETE request to delete a comment by ID with authGuard middleware
router.delete(
  "/delete-comment/:commentId",
  authGuard,
  commentController.deleteComment
);

module.exports = router;
