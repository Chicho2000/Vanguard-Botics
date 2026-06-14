import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Protect all routes
router.use(requireAuth);

// Basic placeholder GET route
router.get("/", (req, res) => {
  res.json({ success: true, message: "Parking spots route active" });
});

export default router;
