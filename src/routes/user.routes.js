import { Router } from 'express';

import { changeCurrentUserPassword, currentUserDetails, getChannelUserProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateUserAvatar } from '../controllers/user.controller.js';
import {isLoggedIn} from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);

router.route('/login').post(loginUser);

//secured routes
router.route('/logout').post(isLoggedIn, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(isLoggedIn,changeCurrentUserPassword);
router.route('/user-details').post(isLoggedIn,currentUserDetails);
router.route('/update-details').post(isLoggedIn,updateAccountDetails);
router.route('/update-avatar').post(isLoggedIn,upload.single('avatar'),updateUserAvatar);
router.route('/update-coverImage').post(isLoggedIn,upload.single('coverImage'),updateCoverImage);
router.route('/get-channel').post(isLoggedIn,getChannelUserProfile);
router.route('/get-watchHistory').post(isLoggedIn,getWatchHistory);

export default router;