import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema(
    {
        videoFile:{
            type:String, //cloudniary
            required:true
        },
        thumbnail:{
            type:String, //cloudniary
            required:true
        },
        title:{
            type:String, 
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:NUmber, //cloudinary
            required:true
        },
        view:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref:"User"
        }


    },
    {
        timestamp:true
    }
)


videoSchema.plugin(mongooseAggregatePaginate)
export const video = mongoose.model("Video",videoSchema)
