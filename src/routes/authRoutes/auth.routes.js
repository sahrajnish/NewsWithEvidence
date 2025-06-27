import express from "express";
import { registerUser, verifyEmail } from "../../controllers/authController/registerUser.js";

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);

export default router;