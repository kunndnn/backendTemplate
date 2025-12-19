import {
  userDelete,
  userDetail,
  usersListing,
  userStatusChange,
} from "#controllers/admin/user.controller";
import { Router } from "express";
const router = Router();

router.post('/user-list',usersListing)
router.get("/user-get", userDetail);
router.delete("/user-delete/:userId", userDelete);
router.get("/user-status-toggle", userStatusChange);
export default router;
