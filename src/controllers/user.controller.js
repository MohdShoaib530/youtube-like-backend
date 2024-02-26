import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'
import User from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import apiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const options = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken =  user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()
    
        user.refreshToken = refreshToken
    
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new apiError(500, "something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }
    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new apiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id)

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler( async (req, res, next) => {
    const {username, email, password} = req.body;

    if(!username && !email){
        throw new apiError(401,"username or email is required !")
    }

    const user = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    }).select("+password")

    if(!user){
        throw new apiError(404,"OOPS!! User does not exists !")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log("passval",isPasswordValid);

    if(!isPasswordValid){
        throw new apiError(404,"Password does not match")
    };

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    console.log('acc',accessToken,'ref',refreshToken);

    const loggedInUser = await User.findById(user._id)

    return  res
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken,options)
                .json(
                    new apiResponse(
                        200,
                        {
                            user: loggedInUser,
                                  refreshToken,
                                  accessToken
                        },
                        "user loggedIn successfully"
                    )
                )

});

const logoutUser = asyncHandler( async (req,res,next) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
               refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return  res
            .status(200)
            .clearCookie("refreshToken",options)
            .clearCookie("accessToken",options)
            .json(
                new apiResponse(200,{}, "user logged out successfully")
            )
    
})

const refreshAccessToken = asyncHandler(async (req,res,next) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
        if(!incomingRefreshToken){
            throw new apiError(401,"Unauthorized request")
        };
    
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new apiError(401,"Invalid refreshToken")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401,"refreshToken is expired or used")
        }
    
        const {newRefreshToken, accessToken} = await generateAccessAndRefreshToken(user?._id)
    
        return res
               .status(200)
               .cookie("accessToken",accessToken,options)
               .cookie("refreshToken",newRefreshToken,options)
               .json(
                  new apiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "accessToken refreshed successfully"
                    )
                )
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid request")
    }
})

const changeCurrentUserPassword = asyncHandler(async (req,res) => {
    const {oldPassword , newPassword} = req.body;

    if(!(oldPassword && newPassword)){
       throw new apiError(401,"oldPassword and newPassword are required to change the passord")
    };

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new apiError(400,"Invalid old password")
    };

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new apiResponse(200,{},"Password changed successfully")
    )
})

const  getCurrentUser = asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json(
        new apiResponse(200,req.user,"User details fetched successfully")
    )
})

const updateAccountDetails = asyncHandler (async (req,res) => {
    const {fullName, email,} = req.body;

    if(!(fullName && email)){
        throw new apiError(401,"all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new apiResponse(200,user,"Account details updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new apiError(401,"Avatar file is missing")
    };

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new apiError(400,"Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "User avatar updated successfully")
    )
})
const updateCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new apiError(401,"Avatar file is missing")
    };

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new apiError(400,"Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "User coverImagew updated successfully")
    )
})

const getChannelUserProfile = asyncHandler(async (req,res) => {
    const {username} = req.params;

    if(!username?.trim()){
        throw new apiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as:"subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new apiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200,channel[0],"user channel fetched successfully")
    )

});

const getWatchHistory = asyncHandler(async (req,res) => {
    const user = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(200,user[0].watchHistory,"watchHistory fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserAvatar,
    updateCoverImage,
    getChannelUserProfile
}