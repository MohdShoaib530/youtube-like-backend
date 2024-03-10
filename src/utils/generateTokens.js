import User from '../models/user.model.js';
import apiError from './apiError.js';

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken =  user.generateAccessToken();
        const refreshToken =  user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new apiError(500, 'something went wrong while generating refresh and access token');
    }
};

export default generateTokens;