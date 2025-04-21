import express, { Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/soil-classification", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const filePath = req.file.path;
    const flaskAPI = "http://127.0.0.1:5000/soil-predict";

    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath)); // Change "file" to "image"


    const response = await axios.post(flaskAPI, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    fs.unlinkSync(filePath);
    res.json(response.data);
  } catch (error) {
    console.error("Error classifying soil:", error);
    res.status(500).json({ error: "Failed to process the image" });
  }
});

export default router;
