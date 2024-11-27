const router = require("express").Router();
const userController = require("../controllers/userControllers");
const { authGuard } = require("../middleware/authGuard");

router.post("/create", userController.createUser);

router.post("/login", userController.loginUser);

router.get("/users", userController.getAllUsers);

router.delete("/delete/:userId", authGuard, userController.deleteUser);

router.put("/edit/:userId", authGuard, userController.editUser);

router.put("/change-password", authGuard, userController.changePassword);

router.post("/request-code", userController.requestCode);

router.post(
  "/verify-code-and-change-password",
  userController.verifyCodeAndChangePassword
); 

router.put("/:userId/role", userController.updateUserRole);

router.get("/profile/:userId", authGuard, userController.getUserDetails);

//export
module.exports = router;
