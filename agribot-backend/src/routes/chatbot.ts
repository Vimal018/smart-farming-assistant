import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/chatbot", async (req, res): Promise<void> => {
  try {
    const { message } = req.body;

    // Call your Flask API here
    const response = await axios.post("http://127.0.0.1:5000/api/chatbot", {
      message,
    });

    res.status(200).json({ reply: response.data.reply });
    return    
  } catch (error) {
    console.error("Error communicating with Flask API:", error);
     res.status(500).json({ error: "AI service error" });
      return;
  }
});

export default router;
