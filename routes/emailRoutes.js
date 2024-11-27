const express = require("express");
const router = express.Router();
const sendEmail = require("../controllers/emailControllers");

// POST /email/send-email route handler
router.post("/send-email", sendEmail);

module.exports = router;
