// const router = require('express').Router();
// const blogController = require('../controllers/blogControllers');

// // router.post('/create-blog', blogController.createBlog)

// router.post('/create-blog', (req, res) => {
//     res.send('Creating a blog...');
//   });

// //export
// module.exports = router;
const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogControllers");
const { authGuard } = require("../middleware/authGuard"); // Import authGuard middleware

// Create Blog API endpoint with authGuard middleware
router.post("/create-blog", authGuard, blogController.createBlog);
router.get("/get-blogs", blogController.getAllBlogs);
router.get("/get-single-blog/:blogId", blogController.getSingleBlog);
router.delete("/delete-blog/:blogId", authGuard, blogController.deleteBlog);
router.put("/edit-blog/:blogId", authGuard, blogController.editBlog);
router.get("/get_pagination", blogController.getPagination)
router.get("/search-blog", blogController.searchBlogByTitle);


module.exports = router;
