import Tweet from '../models/tweet.model.js';
import apiError from '../utils/ApiError.js';
import apiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createTweet = asyncHandler (async (req, res, next) => {
    const {content} = req.body;

    const tweeted = await Tweet.create({
        owner: req.user?._id,
        content: content || ''
    });

    if(!tweeted){
        throw next(new apiError(400,'Unable to tweet now'));
    }

    res
        .status(200)
        .json(new apiResponse(200,tweeted,'tweeted successfully'));


});

export {
    createTweet
};