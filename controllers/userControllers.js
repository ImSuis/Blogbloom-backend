const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const createUser = async (req, res) => {
  // Step 1: Check if data is coming or not
  console.log(req.body);

  // Step 2: Destructure the data
  const { firstName, lastName, email, password } = req.body;

  // Step 3: Validate the incoming data
  if (!firstName || !lastName || !email || !password) {
    return res.json({
      success: false,
      message: "Please fill all the fields.",
    });
  }

  // Step 4: Try-catch block
  try {
    // Step 5: Check existing user
    const existingUser = await Users.findOne({ email: email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists.",
      });
    }

    // Password encryption
    const randomSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, randomSalt);

    // Step 6: Create new user
    const newUser = new Users({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: encryptedPassword,
    });

    // Step 7: Save user and response
    await newUser.save();
    res.status(200).json({
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server Error");
  }
};

const loginUser = async (req, res) => {
  // Step 1: Check if data is coming or not
  console.log(req.body);

  // Step 2: Destructure the data
  const { email, password } = req.body;

  // Step 3: Validate the incoming data
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please fill all the fields.",
    });
  }

  // Step 4: Try-catch block
  try {
    // Step 5: Find user
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist.",
      });
    }
    // Step 6: Check password
    const passwordToCompare = user.password;
    const isMatch = await bcrypt.compare(password, passwordToCompare);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Password does not match.",
      });
    }

    // Step 7: Create token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_TOKEN_SECRET
    );

    // Step 8: Send Response
    res.status(200).json({
      success: true,
      token: token,
      userData: user,
      message: "User logged in successfully.",
    });
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

const editUser = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email } = req.body;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update user fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateUserRole = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Toggle the isAdmin field
    user.isAdmin = !user.isAdmin;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Find the user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect old password.",
      });
    }

    // Validate the new password
    // Add any additional validation logic here if needed

    // Encrypt the new password
    const randomSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(newPassword, randomSalt);

    // Update the user's password
    user.password = encryptedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Generate a random 6-letter code
const generateRandomCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Send code to user's email
const sendCodeToEmail = async (email, code) => {
  // Create a nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Construct email message
  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Password Reset Code",
    text: `Your verification code is: ${code}`,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

// Request code for password reset
const requestCode = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Generate and store code
    const code = generateRandomCode();
    user.resetCode = code;
    await user.save();

    // Send code to user's email
    await sendCodeToEmail(email, code);

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Verify code and change password
const verifyCodeAndChangePassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify the code
    if (code !== user.resetCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    // Encrypt the new password
    const randomSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(newPassword, randomSalt);

    // Update the user's password and reset code
    user.password = encryptedPassword;
    user.resetCode = null; // Clear the reset code after successful password change
    await user.save();

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    // Extract user ID from request parameters
    const { userId } = req.params;

    // Find the user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Exclude sensitive information like password
    const userDetails = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin, // Include any other necessary fields
    };

    res.status(200).json({
      success: true,
      user: userDetails,
      message: "User details retrieved successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  editUser,
  deleteUser,
  changePassword,
  requestCode,
  verifyCodeAndChangePassword,
  updateUserRole,
  getUserDetails,
};
