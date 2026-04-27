import { Router } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Proteger todas las rutas de usuarios
router.use(requireAuth);

router.get("/", requireAdmin, async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true }
    });
    res.json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener usuarios" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        role: role || "CLIENTE"
      },
      select: { id: true, email: true, name: true, role: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear usuario" });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { id: true, email: true, name: true, phone: true, role: true }
    });
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  // Implementación PUT completa
  try {
    const { email, name, phone, role } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { email, name, phone, role },
      select: { id: true, email: true, name: true, role: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  // Implementación PATCH parcial
  try {
    const data = req.body;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data,
      select: { id: true, email: true, name: true, role: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar" });
  }
});

export default router;
