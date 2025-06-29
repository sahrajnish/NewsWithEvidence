import express from "express";
import { handleRegisterUser, handleVerifyEmail } from "../../controllers/authController/registerUser.js";
import { handleLoginUser } from "../../controllers/authController/loginUser.js";
import { handleForgetPassword } from "../../controllers/authController/forgetPassword.js";
import { handleResetPassword } from "../../controllers/authController/resetPassword.js";
import passport from "passport";
import { handleGoogleLogin, handleGoogleLoginFailure } from "../../controllers/authController/GoogleAuth/googleLogin.js";

const router = express.Router();

router.post('/register', handleRegisterUser);
router.get('/verify-email/:token', handleVerifyEmail);

router.post('/login', handleLoginUser);
router.post('/forget-password', handleForgetPassword);
router.post('/reset-password/:token', handleResetPassword);

// google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
        failureRedirect: '/api/auth/google/failure'
    }),
    handleGoogleLogin
);

router.get('/google/failure', handleGoogleLoginFailure);

export default router;