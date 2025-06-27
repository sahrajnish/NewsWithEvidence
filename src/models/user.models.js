import mongoose from "mongoose";

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
        }
    }, {
        timestamps: true
    }
)

const Users = mongoose.model("users", userSchema);

export default Users;