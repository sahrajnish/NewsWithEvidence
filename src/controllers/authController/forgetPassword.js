import Users from "../../models/user.models.js";
import crypto from "crypto";
import sendEmail from "../../utils/sendEmail.js";

const handleForgetPassword = async (req, res) => {
    const { email } = req.body;

    if(!email) {
        return res.status(400).json({
            response: "error",
            message: "Email is required to reset password"
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            response: "error",
            message: "Invalid email format"
        });
    }

    let user;

    try {
        user = await Users.findOne({ "personalDetails.email": email });
        if(!user) {
            return res.status(200).json({
                response: "success",
                message: "If an account with that email exists, a password reset link has been sent."
            })
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest('hex');
        
        user.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process within 10 minutes:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

        await sendEmail({
            email: user.personalDetails.email,
            subject: "Your Password Reset Link",
            message
        });

        return res.status(200).json({
            response: "success",
            message: "If an account with that email exists, a password reset link has been sent."
        })
    } catch (error) {
        console.log(`Something went wrong while resetting password: ${error}`);
        if(user) {
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
        return res.status(500).json({
            response: "error",
            message: `Something went wrong while resetting password: ${error}`
        })
    }
}

export {
    handleForgetPassword
}