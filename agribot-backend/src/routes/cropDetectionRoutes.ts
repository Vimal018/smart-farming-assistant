import express, { Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const router = express.Router();

// Multer storage (temporary)
const upload = multer({ dest: "uploads/" });

router.post("/crop-disease-detection", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const filePath = req.file.path; // Path of the uploaded image
    const flaskAPI = process.env.FLASK_API_URL || "http://localhost:5000"; // Flask API endpoint

    // Send image to Flask server
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(`${flaskAPI}/predict`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Cleanup: Remove file after sending
    fs.unlinkSync(filePath);

    // Send Flask response back to frontend
    await res.json(response.data);
  } catch (error) {
    console.error("Error detecting crop disease:", error);
    res.status(500).json({ error: "Failed to process the image" });
  }
});

export default router;
