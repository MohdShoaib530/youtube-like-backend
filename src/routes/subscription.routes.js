import { Router } from 'express';

import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription
} from '../controllers/subscription.controller.js';
const router = Router();
import { isLoggedIn } from '../middlewares/auth.middleware.js';
router.use(isLoggedIn); // Apply verifyJWT middleware to all routes in this file


router
    .route('/c/:channelId')
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route('/u/:subscriberId').get(getUserChannelSubscribers);

export default router;