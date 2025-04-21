import express, { Request, Response } from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import cors from "cors";
import path from "path";
import multer from "multer";
import cropDetectionRoutes from "./routes/cropDetectionRoutes";
import soilClassificationRoutes from "./routes/soilClassificationRoutes";
import cropRecommendationRoutes from "./routes/cropRecommendationRoutes";
import chatbotRoute from "./routes/chatbot";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // JSON body parser
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies/sessions
  })
);

// Routes
app.use("/", authRoutes);
app.use("/", cropDetectionRoutes);
app.use("/", soilClassificationRoutes);
app.use("/", cropRecommendationRoutes);
app.use("/", chatbotRoute);
// Default route (for testing)
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));