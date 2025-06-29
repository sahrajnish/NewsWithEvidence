import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        personalDetails: {
            firstname: {
                type: String
            },
            middlename: {
                type: String
            },
            lastname: {
                type: String
            },
            email: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            mobileNumber: {
                type: String
            }
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationTokenExpires: {
            type: Date
        },
        refreshToken: {
            type: String
        },
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date
        },
        passwordResetToken: {
            type: String
        },
        passwordResetTokenExpires: {
            type: Date
        }
    }, {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("personalDetails.password")) return next;

    this.personalDetails.password = await bcrypt.hash(this.personalDetails.password, 12);

    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.personalDetails.password);
}

const Users = mongoose.model("users", userSchema);

export default Users;