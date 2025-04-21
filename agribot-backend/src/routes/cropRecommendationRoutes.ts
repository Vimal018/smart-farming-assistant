import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

router.post("/crop-recommendation", async (req: Request, res: Response): Promise<void> => {
  try {
    const { soilType, district } = req.body;
    if (!soilType || !district) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const flaskAPI = "http://127.0.0.1:5000/recommend-crops"; // Flask API endpoint

    const response = await axios.post(flaskAPI, { soil_type: soilType, district });

    res.json(response.data);
  } catch (error) {
    console.error("Error getting crop recommendation:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

export default router;
