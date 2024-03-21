import asyncHandler from '../utils/asyncHandler.js';


const healthcheck = asyncHandler(async (req, res) => {
    res
        .status(200)
        .json(200,'Health details of the user are here');
});

export {
    healthcheck
};
