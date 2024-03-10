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

// Server Status Check Route
app.get('/server', (_req, res) => {
    res.send('wow! Server is working good');
});

// importing all routes
import errorMiddleware from './middlewares/error.middleware.js';
import userRouter from './routes/user.routes.js';

app.use('/api/v1/users',userRouter);

// Default catch all route - 404
app.all('*', (_req, res) => {
    res.status(404).send('OOPS!!! 404 Page Not Found');
});

// Custom error handling middleware
app.use(errorMiddleware);

export default app;