const asyncHandler = async (reqHandlerFun) => {
    return (req,res,next) => {
        Promise.resolve(reqHandlerFun(req,res,next)).catch((error) => next(error))
    }
};

export default asyncHandler;

// const asyncHandler = async () => {}
// const asyncHandler = (fn) => () => {}
// const asyncHandler = (fn) => async () => {}

// const asyncHandler = (fn) => async(req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }