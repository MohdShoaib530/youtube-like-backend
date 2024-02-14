import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app = express();

// built in middleware
app.use(express.json({limit: "16kb"}));

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

export default app;