import { LOCK_TIME, MAX_LOGIN_ATTEMPT } from "../../../constants/contants.js";
import Users from "../../models/user.models.js";
import jwt from "jsonwebtoken";

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).json({
            response: "error",
            message: "Email and password are required"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(404).json({
            response: "error",
            message: "Invalid email format"
        });
    }

    try {
        const user = await Users.findOne({ "personalDetails.email": email });

        if (user && user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(403).json({
                response: "error",
                message: `Account is locked due to too many login attempts. Please try again in ${remainingTime} minutes.`
            })
        }

        if (!user || !(await (user.isPasswordCorrect(password)))) {
            if (!user) {
                return res.status(404).json({
                    response: "error",
                    message: "Invalid Credentials"
                })
            }

            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPT) {
                user.lockUntil = Date.now() + LOCK_TIME;
                await user.save({ validateBeforeSave: false });
                return res.status(403).json({
                    response: "error",
                    message: "Account locked due to too many login attempts. Please try again after 15 minutes."
                });
            }
            await user.save({ validateBeforeSave: false });

            const leftLoginAttempts = MAX_LOGIN_ATTEMPT - user.failedLoginAttempts;

            return res.status(404).json({
                response: "error",
                message: "Invalid Credentials",
                loginAttemptLeft: leftLoginAttempts
            });
        }

        if (!user.isEmailVerified) {
            return res.status(404).json({
                response: "error",
                message: "Please verify your email to continue"
            });
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;

        const accessToken = jwt.sign(
            { "id": user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { "id": user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        )

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            response: "success",
            message: "Login successful",
            data: {
                id: user._id,
                accessToken: accessToken
            }
        })
    } catch (error) {
        console.log("Something went wrong while logging in: ", error);
        return res.status(500).json({
            response: "error",
            message: `Error while logging in: ${error}`
        });
    }
}

export {
    loginUser
}