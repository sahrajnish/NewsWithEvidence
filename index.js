import dotenv from "dotenv";
import connectDB from "./src/config/connectDB.js";
import { DB_NAME } from "./constants/contants.js";
import express from "express";
import authRouter from "./src/routes/authRoutes/auth.routes.js";
import cookieParser from "cookie-parser";

dotenv.config({
    path: "./.env"
});

const app = express();
const PORT = process.env.PORT;

connectDB(`${process.env.MONGO_DB_URI}${DB_NAME}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));