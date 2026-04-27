import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import usuariosRoutes from "./routes/usuarios";

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);

// Catch all error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
