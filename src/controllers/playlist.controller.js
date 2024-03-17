import { Playlist } from '../models/playlist.model.js';
import apiError from '../utils/ApiError.js';
import apiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createPlaylist = asyncHandler(async (req, res, next) => {
    console.log('videos array url',req.body.videos);

    const { name, description, videos } = req.body;
    const userId = req.user?._id;

    if(!name || !videos || !description){
        throw next(new apiError(400,'all fields are required to create a playlist'));
    }

    const playList = await Playlist.create({
        name,
        description,
        videos,
        owner: userId
    });

    if(!playList){
        throw next(new apiError(500,'something went wrong while creating playlist'));
    }

    res
        .status(200)
        .json(new apiResponse(200,playList,'playlist created successfully'));

});
const getPlaylistById = asyncHandler(async (req, res, next) => {

});
const updatePlaylist = asyncHandler(async (req, res, next) => {

});
const deletePlaylist = asyncHandler(async (req, res, next) => {

});
const addVideoToPlaylist = asyncHandler(async (req, res, next) => {

});
const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {

});
const getUserPlaylists = asyncHandler(async (req, res, next) => {

});

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylists
};