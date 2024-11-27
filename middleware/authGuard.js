const jwt = require("jsonwebtoken");
require("dotenv").config();

const authGuard = (req, res, next) => {
  //get header authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("Authorization header not found");
    return res.json({
      success: false,
      message: "Authorization header not found",
    });
  }

  //get token
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Token not found");
    return res.json({
      success: false,
      message: "Token not found",
    });
  }

  try {
    const decodeUser = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    console.log("Decoded User:", decodeUser);
    req.user = decodeUser;
    next();
  } catch (error) {
    console.log("Invalid token:", error.message);
    res.json({
      success: false,
      message: "Invalid token",
    });
  }
};

const authGuardAdmin = (req, res, next) => {
  //get header authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("Authorization header not found");
    return res.json({
      success: false,
      message: "Authorization header not found",
    });
  }

  //get token
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Token not found");
    return res.json({
      success: false,
      message: "Token not found",
    });
  }

  try {
    const decodeUser = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    console.log("Decoded User:", decodeUser);
    req.user = decodeUser;

    //check if user is admin
    if (!req.user.isAdmin) {
      console.log("User is not an admin");
      return res.json({
        success: false,
        message: "Permission denied. Admin access required.",
      });
    }

    next();
  } catch (error) {
    console.log("Invalid token:", error.message);
    res.json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = { authGuard, authGuardAdmin };
