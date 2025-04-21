import express from "express";
import { registerUser, loginUser} from "../controllers/authController";
import { protectRoute } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/protected", protectRoute, (req, res): void => {
  res.json({ message: "Protected Route Accessed" });
});

export default router;
