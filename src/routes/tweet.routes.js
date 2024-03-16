import { Router } from 'express';

import { createTweet } from '../controllers/tweet.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(isLoggedIn);
router.route('/').post(createTweet);

export default router;