import { Router } from "express";
import {
  login,
  profile,
  refreshtoken,
  resetPassword,
  sendOTP,
  updatePassword,
  verifyOTP,
} from "#controllers/admin/auth.controller";
import { upload } from "#middlewares/fileUpload";
import { verifyToken } from "#middlewares/verifyToken";
const router = Router();

router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.route("/refresh-token").post(refreshtoken); // generate refresh token

router
  .route("/profile")
  .get(verifyToken, profile) // get profile
  .post(verifyToken, upload.single("image"), profile); // update profile
router.post("/update-password", verifyToken, updatePassword);
export default router;
