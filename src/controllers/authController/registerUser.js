import Users from "../../models/user.models.js";
import crypto from "crypto";
import sendEmail from "../../utils/sendEmail.js";

const registerUser = async (req, res) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    if(!firstname.trim() || !lastname.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        return res.status(404).json({
            response: "error",
            message: "All fields are required"
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        return res.status(404).json({
            response: "error",
            message: "Invalid email format"
        })
    }

    if(firstname.trim().length < 3) {
        return res.status(404).json({
            response: "error",
            message: "First name must be atleast 3 characters long"
        })
    }

    if(lastname.trim().length < 3) {
        return res.status(404).json({
            response: "error",
            message: "Last name must be atleast 3 characters long"
        })
    }

    if(password.trim() !== confirmPassword.trim()) {
        return res.status(404).json({
            response: "error",
            message: "Confirm password does not match password"
        })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if(!passwordRegex.test(password)) {
        return res.status(404).json({
            response: "error",
            message: "Password must contain atleast 1 uppercase, 1 lowercase, 1 digit, 1 special character and minimum of 8 characters"
        })
    }

    try {
        const findUser = await Users.findOne({ "personalDetails.email": email });
        if(findUser) {
            return res.status(404).json({
                response: "error",
                message: "User already exists"
            })
        }

        const userCreated = await Users.create({
            personalDetails: {
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: password
            }
        })

        const verificationToken = crypto.randomBytes(32).toString("hex");

        userCreated.emailVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");
        
        userCreated.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;

        await userCreated.save();

        const verificationUrl = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;

        const message = `To verify your email, please click on the following link or paste it into your browser: \n\n ${verificationUrl} \n\nThis link will expire in 10 minutes. If you did not create an account, please ignore this email.`;

        await sendEmail({
            email: userCreated.personalDetails.email,
            subject: 'Verify your email address',
            message
        })

        return res.status(200).json({
            response: "success",
            message: "Registration successful! Please check your email to verify your account."
        })
    } catch (error) {
        console.log(`Registration error: ${error}`);
        return res.status(500).json({
            response: "error",
            message: `Something went wrong. ${error}`
        })
    }
};

const verifyEmail = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await Users.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationTokenExpires: { $gt: Date.now() }
        });

        if(!user) {
            return res.status(404).json({
                response: "error",
                message: "Token is invalid or expired."
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            response: "success",
            message: "Email verified successfully. You can now login."
        })
    } catch (error) {
        console.log("Email verification failed: ", error);
        return res.status(500).json({
            response: "error",
            message: `Something went wrong. ${error}`
        });
    }
}

export {
    registerUser,
    verifyEmail
}