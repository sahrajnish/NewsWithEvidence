import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import Users from "../models/user.models.js";

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            const email = profile.emails[0].value;

            let user = await Users.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }

            user = await Users.findOne({ "personalDetails.email": email });
            if(user) {
                user.googleId = profile.id;
                user.isEmailVerified = true;
                await user.save({ validateBeforeSave: false });
                return done(null, user);
            }

            const newUser = new Users({
                googleId: profile.id,
                personalDetails: {
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    email: profile.emails[0].value
                },
                isEmailVerified: true
            });
            await newUser.save();
            return done(null, newUser);
        } catch (error) {
            console.log("Error from passport-setup: ", error);
            return done(error, null);
        }
    }
))