import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { userController } from "../controllers/user.controller";
import { validateBody } from "../middleware/validate";
import { adminCreateUserSchema, adminUpdateUserSchema } from "../validation/schemas";

const router = Router();

// Protect all user routes
router.use(requireAuth);

router.get("/", requireAdmin, userController.getUsers);
router.post("/", requireAdmin, validateBody(adminCreateUserSchema), userController.createUser);
router.get("/:id", requireAdmin, userController.getUserById);
router.put("/:id", requireAdmin, validateBody(adminUpdateUserSchema), userController.updateUser);
router.patch("/:id", requireAdmin, validateBody(adminUpdateUserSchema), userController.patchUser);
router.delete("/:id", requireAdmin, userController.deleteUser);

export default router;
