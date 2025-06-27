import express from "express";
import { registerUser, verifyEmail } from "../../controllers/authController/registerUser.js";
import { loginUser } from "../../controllers/authController/loginUser.js";

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);

router.post('/login', loginUser);

export default router;