/* eslint-disable no-console */
import { v2 } from 'cloudinary';
import mongoose, {isValidObjectId} from 'mongoose';

import Video from '../models/video.model.js';
import apiError from '../utils/ApiError.js';
import apiRsponse from '../utils/ApiResponse.js';
import apiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import uploadOnCloudinary from '../utils/cloudinary.js';

// Function to build the aggregation pipeline
const buildPipeline = ({ query, sortBy, sortType, page, limit }) => {
    const pipeline = [];

    // Match stage based on query (if provided)
    if (query) {
        pipeline.push({ $match: { title: { $regex: query, $options: 'i' } } });
    }

    // Sort stage based on sortBy and sortType (if provided)
    if (sortBy && sortType) {
        const sortOption = {};
        sortOption[sortBy] = sortType === 'desc' ? -1 : 1;
        pipeline.push({ $sort: sortOption });
    }

    // Pagination stage using $skip and $limit
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit, 10) });
    console.log('pipeline',pipeline);
    return pipeline;
};

const getAllVideos = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

    // Pagination using mongoose-aggregate-paginate-v2
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    try {

        const pipeline = buildPipeline({ query, sortBy, sortType, page, limit });

        // Use the aggregatePaginate() method provided by mongoose-aggregate-paginate-v2
        const {docs} = await Video.aggregatePaginate(pipeline, options);
        console.log('docs',docs);
        res.status(200).json(
            new apiRsponse(201,docs,'Videos fetched successfully')
        );
    } catch (error) {
        console.log('error',error);
        throw next(new apiError(500,'Couldn\'t fetch the videos from server'));
    }

});

const publishAVideo = asyncHandler(async (req, res, next) => {
    const { title, description} = req.body;

    if(!title || !description){
        throw next(new apiError(400,'title and description both are required'));
    }

    if(!req.files?.videoFile || !req.files?.thumbnail){
        throw next(new apiError(400,'VideoFile and thumbnail both are required'));
    }

    if(req.files){

        try {
            const uploadVideo = await uploadOnCloudinary(req.files?.videoFile[0].path);
            const uploadThumbnail = await uploadOnCloudinary(req.files?.thumbnail[0].path);

            const video = Video.create({
                videoFile: {
                    public_id: uploadVideo.public_id,
                    secure_url: uploadVideo.secure_url
                },
                thumbnail: {
                    public_id: uploadThumbnail.public_id,
                    secure_url: uploadThumbnail.secure_url
                },
                title: title,
                description: description,
                duration: uploadVideo.duration,
                views: 0,
                isPublished: true,
                owner: req.user?._id
            });
            res
                .status(201)
                .json(
                    new apiRsponse(201,video,'Video has been uploaded successfully')
                );
        } catch (error) {
            console.log('error',error);
            throw next(new apiError(500,'Unable to upload videos on server'));
        }
    }

});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log('videoid',videoId);

    const video = await Video.findById(videoId);
    console.log('video',video);

    res
        .status(200)
        .json(new apiRsponse(200,video,'Video data fetched successfully'));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const {title, description } = req.body;

    try {
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                title,
                description
            },
            {
                new: true
            }
        );

        if (!video) {
            return next(new apiError(404, 'Video not found'));
        }

        if(req.file){
            console.log('thumbnail',req.file);

            const destroythumb = await v2.uploader.destroy(video.thumbnail.public_id);

            if(destroythumb){
                const thumbnail = await uploadOnCloudinary(req.file.path);

                video.thumbnail.public_id = thumbnail.public_id,
                video.thumbnail.secure_url = thumbnail.secure_url;
                video.save();

            }
            res
                .status(200)
                .json(new apiResponse(200,video,'video data updated successfully'));
        }
    } catch (error) {
        console.log(error),error;
        throw next(new apiError(400,error.message || 'something went wrong'));
    }

});

const deleteVideo = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    try {
        const video = await Video.findById(videoId);
        const destroyThumbnail = await v2.uploader.destroy(video.thumbnail.public_id);
        console.log('destroyThumbnail',destroyThumbnail);
        const destroyVideo = await v2.uploader.destroy(video.videoFile.public_id);
        console.log('destroyVideo',destroyVideo);

        const destroyVideoFromDb = await Video.findByIdAndDelete(video?._id);

        res
            .status(200)
            .json( new apiResponse(200,destroyVideoFromDb,'Video has been deleted from database'));


    } catch (error) {
        console.log('error',error);
        throw next(new apiError(400,error.message || 'Something went wrong'));
    }

});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            isPublished: false
        },
        {
            new: true
        }
    );

    res
        .status(200)
        .json(new apiResponse(200,video,'publish has been toggeled'));


});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
