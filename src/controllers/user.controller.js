import asynHandler from "../utils/asyncHandler"


const registerUser = asynHandler(async ( req, res) => {
    res.status(200).json({
        message:"ok"
    })
})


export default registerUser