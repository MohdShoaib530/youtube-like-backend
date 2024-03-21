import mongoose, { get } from 'mongoose';

import {Like} from '../models/like.model.js';
import {Subscription} from '../models/subscription.model.js';
import User from '../models/user.model.js';
import Video from '../models/video.model.js';
import apiError from '../utils/ApiError.js';
import apiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const getChannelStats = asyncHandler(async (req, res) => {

    // const result = await mongoose.Collection.aggregate(pipeline);

    const channelDetails = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'channelDetails'
            }
        }

    ]);

    res
        .status(200)
        .json(new apiResponse(200,channelDetails,'channel details are here'));

    if(!channelDetails){
        throw next(new apiError(500,'Internal server issue while fetching the channel details'));
    }

    res
        .status(200)
        .json(new apiResponse(200,result,'channel details'));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const getChannelVideos = await Video.find({owner: req.user?._id});

    if(!getChannelVideos){
        throw next( new apiError(200,'something went wrong while fetching the videos'));
    }

    res
        .status(200)
        .json(new apiResponse(200,getChannelVideos,'channel videos are here'));

});

export {
    getChannelStats,
    getChannelVideos
};