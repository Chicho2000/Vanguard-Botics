import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { userController } from "../controllers/user.controller";

const router = Router();

// Protect all user routes
router.use(requireAuth);

router.get("/", requireAdmin, userController.getUsers);
router.post("/", requireAdmin, userController.createUser);
router.get("/:id", requireAdmin, userController.getUserById);
router.put("/:id", requireAdmin, userController.updateUser);
router.patch("/:id", requireAdmin, userController.patchUser);
router.delete("/:id", requireAdmin, userController.deleteUser);

export default router;
