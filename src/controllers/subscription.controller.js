import { Subscription } from '../models/subscription.model.js';
import apiError from '../utils/ApiError.js';
import apiResponse from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const getSubscribedChannels = asyncHandler(async(req, res, next) => {

    const subscribedChannels = await Subscription.find({'subscriber': req.user?._id});

    if(!subscribedChannels){
        throw next(new apiError(404,'user has not subscribed any channel'));
    }

    res
        .status(200)
        .json(new apiResponse(200,subscribedChannels,'Subscribed channels details'));
});
const getUserChannelSubscribers = asyncHandler(async(req, res, next) => {

    const userChannelSubscribers = await Subscription.find({'channel': req.user?._id});

    if(!userChannelSubscribers){
        throw next(new apiError(404,'User has no subscribers'));
    }

    res
        .status(200)
        .json(new apiResponse(200,userChannelSubscribers,'channel subscriber detail'));
});
const toggleSubscription = asyncHandler(async(req, res, next) => {
    try {
        const subscriberId = req.user?._id;
        const channelId = req.params.channelId;

        const deletedSubscription = await Subscription.deleteOne({
            subscriber: subscriberId,
            channel: channelId
        });

        if (deletedSubscription.deletedCount === 0) {
            throw next(new apiError(500,'Subscription not found'));
        }

        res
            .status(200)
            .json( new apiResponse(200,deletedSubscription,'Subscription deleted successfully'));
    } catch (error) {
        console.error(error);
        next(new apiError(500,'Internal server error'));
    }

});

export {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription
};