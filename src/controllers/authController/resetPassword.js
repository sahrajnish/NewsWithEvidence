import Users from "../../models/user.models.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

const handleResetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    if(!password || !confirmPassword) {
        return res.status(400).json({
            response: "error",
            message: "Password and Confirm Password are required"
        });
    }

    if(password.trim() !== confirmPassword.trim()) {
        return res.status(400).json({
            response: "error",
            message: "Confirm password does not match password"
        })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if(!passwordRegex.test(password)) {
        return res.status(400).json({
            response: "error",
            message: "Password must contain atleast 1 uppercase, 1 lowercase, 1 digit, 1 special character and minimum of 8 characters"
        })
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await Users.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpires: { $gt: Date.now() }
        });
        if(!user) {
            return res.status(400).json({
                response: "error",
                message: "Token invalid or expired"
            });
        }

        const isSamePassword = await bcrypt.compare(password, user.personalDetails.password);
        if(isSamePassword) {
            return res.status(400).json({
                response: "error",
                message: "New password cannot be the same as the previous password"
            })
        }

        user.personalDetails.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save();

        return res.status(200).json({
            response: "success",
            message: "Password has been reset successfully."
        })
    } catch (error) {
        console.log(`Something went wrong in handleResetPassword function: ${error}`);
        return res.status(500).json({
            response: "error",
            message: `Something went wrong while resetting password: ${error}`
        })
    }
}

export {
    handleResetPassword
}