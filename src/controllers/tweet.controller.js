import Tweet from '../models/tweet.model.js';
import apiError from '../utils/ApiError.js';
import apiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createTweet = asyncHandler (async (req, res, next) => {
    const {content} = req.body;

    if(!content){
        throw next(new apiError(400,'content is required to tweet'));
    }

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

const getUserTweets = asyncHandler( async (req, res, next) => {
    const userId = req.user?._id;

    const tweets = await Tweet.find({'owner': userId}).populate('owner');

    if(!tweets){
        throw next(new apiError(404,'User has no any tweet recored'));
    }
    console.log('tweets',tweets);

    res
        .status(200)
        .json(new apiResponse(200,tweets,'Thers are the tweets of this user'));
});

const updateTweet = asyncHandler (async(req, res, next) => {
    const {tweetId} = req.params;

    if(!tweetId){
        throw next( new apiError(400,'tweetId is required to update the tweet'));
    }
    const { content } = req.body;

    if(!content){
        throw next(new apiError(400,'content is required to tweet'));
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: content
        },
        {
            new: true
        }
    );

    if(!tweet){
        throw next(new apiError(500,'Something went wrong while creating tweet'));
    }

    res
        .status(200)
        .json(new apiResponse(200,tweet,'Tweet has been updated'));


});

const deleteTweet = asyncHandler( async(req, res, next) => {
    const {tweetId } = req.params;

    if(!tweetId){
        throw next(new apiError(400,'tweetId is required to delete the tweet'));
    }

    const tweetDeleted = await Tweet.findByIdAndDelete(tweetId);

    if(!tweetDeleted){
        throw next(new apiError(500,'could not delete the tweet due to some internal issue'));
    }

    res
        .status(200)
        .json(new apiResponse(200,tweetDeleted,'tweet has been deleted'));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};