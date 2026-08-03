import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import floorsRoutes from "./routes/floors";
import systemConfigsRoutes from "./routes/system-configs";
import statsRoutes from "./routes/stats";
import parkingSessionsRoutes from "./routes/parking-sessions";
import vehiclesRoutes from "./routes/vehicles";
import parkingSpotsRoutes from "./routes/parking-spots";
import subscriptionsRoutes from "./routes/subscriptions";
import paymentsRoutes from "./routes/payments";

const app = express();
app.set("trust proxy", 1);

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/floors", floorsRoutes);
app.use("/system-configs", systemConfigsRoutes);
app.use("/stats", statsRoutes);
app.use("/parking-sessions", parkingSessionsRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/parking-spots", parkingSpotsRoutes);
app.use("/subscriptions", subscriptionsRoutes);
app.use("/payments", paymentsRoutes);

// Catch all error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Internal Server Error:", err);
  const status = Number.isInteger(err?.status) ? err.status : 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Error interno del servidor" : err.message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
