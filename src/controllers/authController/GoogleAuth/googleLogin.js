import jwt from "jsonwebtoken";

const handleGoogleLogin = async (req, res) => {
    try {
        const user = req?.user;
        const accessToken = jwt.sign(
            {"id": user._id},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            {"id": user._id},
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            response: "success",
            message: "Login successfull",
            data: {
                id: user._id,
                accessToken: accessToken
            }
        })
    } catch (error) {
        console.log(`Something went wrong while logging in with google: ${error}`);
        return res.status(500).json({
            response: "error",
            message: `Something went wrong while logging in with google: ${error}`
        })
    }
}

const handleGoogleLoginFailure = async (req, res) => {
    return res.status(401).json({
        response: "error",
        message: "Google authentication failed. Please try again."
    })
}

export {
    handleGoogleLogin,
    handleGoogleLoginFailure
}