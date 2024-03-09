import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import apiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

        const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded) {
            throw new apiError(401, 'Invalid access token !');
        }

        const user = await User.findById(decoded._id);

        if (!user) {
            throw new apiError(401, 'Invalid access token');
        }
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401, error?.message || 'Invalid access token');
    }
});

export default verifyJwt;