const { Router } = require("express");
const router = new Router();
const {
  loginValidations,
  signupValidations,
} = require("../utils/middlewares/validations/auth");
const { validationCheck } = require("../utils/middlewares/validationCheck");
const { upload } = require("../utils/middlewares/fileUpload");
const { verifyToken } = require("../utils/middlewares/verifyToken");

const {
  register,
  login,
  refreshAccessToken,
  logout,
  profile,
  profileUpdate,
  changePass,
} = require("../controllers/authController");

router.route("/register").post(upload.single("image"), register); // register
router.route("/login").post(loginValidations, validationCheck, login); // login
router.route("/refresh-token").post(refreshAccessToken); // geenrate refresh token

router.use(verifyToken); // middleware to verify access token for the below routes
router.route("/logout").post(logout); // logout
router.route("/profile").get(profile); // get profile
router.route("/profile").post(upload.single("image"), profileUpdate); // get profile
router
  .route("/changePassword")
  .post(signupValidations, validationCheck, changePass); //change password

module.exports = router;
