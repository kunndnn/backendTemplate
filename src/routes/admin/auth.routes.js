import { Router } from "express";
import {
  login,
  profile,
  resetPassword,
  sendOTP,
  updatePassword,
  verifyOTP,
} from "#controllers/admin/auth.controller";
import { upload } from "#middlewares/fileUpload";
const router = Router();

router.post("/login", login);
router.post("/send-top", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router
  .route("/profile")
  .get(profile) // get profile
  .post(upload.single("image"), profile); // update profile
router.post("/update-password", updatePassword);
export default router;
