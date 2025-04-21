import express from 'express';
import authRoutes from './authRoutes';
// ... import other route files as needed ...

const router = express.Router();

// Use the auth routes
router.use('/auth', authRoutes);

// ... use other routes as needed ...

export default router;
