import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  validateUser,
  validatePartialUser,
  validateUserId,
} from "../middleware/validate.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

router.param("id", validateUserId);

router.route("/").get(getUsers).post(requireAuth, validateUser, createUser);

router
  .route("/:id")
  .get(getUserById)
  .put(requireAuth, validatePartialUser, updateUser)
  .delete(requireAuth, deleteUser);

export default router;
