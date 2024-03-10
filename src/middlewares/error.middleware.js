/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
// Error handling middleware

import apiError from '../utils/apiError.js';

const errorMiddleware = (err, _req, res, _next) => {
    if (err instanceof apiError) {
        // If the error is an instance of apiError, send a custom error response
        res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data,
            stack : err.stack
        });
    } else {
        // If it's not an instance of apiError, handle it as a generic error
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            errors: [],
            data: null
        });
    }
};
export default errorMiddleware;

// const errorMiddleware = (err, _req, res, _next) => {
//     err.statusCode = err.statusCode || 500;
//     err.message = err.message || 'Something went wrong';

//     res.status(err.statusCode).json({
//         success: false,
//         message: err.message,
//         stack: err.stack
//     });
// };




