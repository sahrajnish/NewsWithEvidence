import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

import "./src/config/passport-setup.js";

import connectDB from "./src/config/connectDB.js";
import { DB_NAME } from "./constants/contants.js";
import express from "express";
import authRouter from "./src/routes/authRoutes/auth.routes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

const app = express();
const PORT = process.env.PORT;

connectDB(`${process.env.MONGO_DB_URI}${DB_NAME}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production"
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send(
        "<h1>Hello</h1>"
    )
})
app.use('/api/auth', authRouter);

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));