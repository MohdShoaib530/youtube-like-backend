import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'
import User from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import apiResponse from '../utils/apiResponse.js'


const registerUser = asyncHandler(async (req,res) =>{
    //   get userdata from frontend
    //  validation - not empty
    //  check if user alreay exists : username or email 
    //  check for image, check for avatar if availabe then upload them on cloudinary
    // create user object  and entry in db
    //  remove password and refresh token field from response
    //  check for user creation 

    const { username, fullname, email, password} = req.body;
    console.log('email',email);

    if([fullname, email, password, username].some((field) => field?.trim() === "")){
        throw new apiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    });

    if(existedUser){
        throw new apiError(409, "User already exists with email or username")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400,"avatar file is required !!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400,"avatar file is required !!")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const userCreated = await User.findById(user_id).select(
        "-password -refreshToken"
    );

    if(userCreated){
        throw new apiError(500,"Something went wrong while regestring the user")
    }

    await userCreated.save();

    return res.status(201).json(
        new apiResponse(200,userCreated,true, "User created successfully")
    )
});

export {registerUser}