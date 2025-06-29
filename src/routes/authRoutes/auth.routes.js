import express from "express";
import { handleRegisterUser, handleVerifyEmail } from "../../controllers/authController/registerUser.js";
import { handleLoginUser } from "../../controllers/authController/loginUser.js";
import { handleForgetPassword } from "../../controllers/authController/forgetPassword.js";
import { handleResetPassword } from "../../controllers/authController/resetPassword.js";

const router = express.Router();

router.post('/register', handleRegisterUser);
router.get('/verify-email/:token', handleVerifyEmail);

router.post('/login', handleLoginUser);
router.post('/forget-password', handleForgetPassword);
router.post('/reset-password/:token', handleResetPassword);

export default router;