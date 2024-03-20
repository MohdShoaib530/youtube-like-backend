import { Like } from '../models/like.model.js';
import apiError from '../utils/ApiError.js';
import apiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const getLikedVideos = asyncHandler( async(req, res, next) => {

    const getLikedVideos = await Like.find({likeBy: req.user?._id});

    if(!getLikedVideos){
        throw next(new apiError(500,'No likes found regard this user'));
    }

    res
        .status(200)
        .json(new apiResponse(200,getLikedVideos,'liked videos by user'));
});
const toggleCommentLike = asyncHandler( async(req, res, next) => {
    const {videoId} = req.params;
    if(!videoId){
        throw next(new apiError(400,'videoId is required to toggle the like'));
    }

    const deleteLike = await Like.findOneAndUpdate(
        req.user?._id,
        {
            video:videoId
        },
        {
            new: true
        });

    if(!deleteLike){
        throw next(new apiError(500,'something went wrong while deleting your like'));
    }

    res
        .status(200)
        .json(200,deleteLike,'like has been deleted');
});
const toggleTweetLike = asyncHandler( async(req, res, next) => {
    const tweetId = req.params;

    if(!tweetId){
        throw next( new apiError(400,'tweetId is required to toggle the tweet'));
    }
    const tweetToggle  = await Like.findOneAndDelete({$and: [{video: videoId,likedBy: req.user?._id}]});

    if(!tweetToggle){
        throw next( new apiError(500,'Something went wrong while toggling the tweet from db'));
    }

    res
        .status(200)
        .json(new apiResponse(200,tweetToggle,'tweet has been toggled'));
});
const toggleVideoLike = asyncHandler( async(req, res, next) => {
    const userId = req.user?._id;
    const { videoId } = req.params;

    if(!userId || !videoId){
        throw next ( new apiError (400,'both fields are required'));
    }

    const togglingVideoLike = await Like.findOneAndDelete({$and: [{video: videoId, likeBy: userId
    }]});

    if(!toggleCommentLike){
        throw next( new apiError (500, 'something went wrong while unliking the video'));
    }


    res
        .status(200)
        .json(new apiResponse(200, togglingVideoLike, 'video has been unliked'));
});

export {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
};