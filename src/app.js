import morgan from 'morgan';
import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

// built in middleware
app.use(express.json({limit: "24kb"}));

app.use(express.urlencoded({
    extended:true,
    limit: "16kb"
}));

app.use(express.static("public"))

// third party middewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(cookieParser())

app.use(morgan("dev"))

// router dec
import userRouter from './routes/user.routes.js';
app.use("/api/v1/users",userRouter)

export default app;