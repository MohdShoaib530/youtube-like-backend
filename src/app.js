import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

/**
 * Express application instance.
 * @type {import('express').Express}
 */
const app = express();

// built in middleware
app.use(express.urlencoded({
    extended:true,
    limit: '16kb'
}));

app.use(express.json({
    limit: '16kb'
}));

app.use(express.static('public'));

// Third-party middlewares
app.use(cors({
    credentials:true,
    origin: process.env.FRONTEND_URL
}));

app.use(cookieParser());

app.use(morgan('dev'));

// routers

export default app;