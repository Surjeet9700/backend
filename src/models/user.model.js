import mongoose, {Schema} from "mongoose";
import { Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudinary ur;
        required:true
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            req:"Video"
        }
    ],
    password:{
        type:String,
        required:[true, 'Password is required']
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})


// to encypyt the password before saving into the database
userSchema.pre("save",  async function (next){
    // Check if the password field has been modified
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})


//validate the password (user password and encrypted password)
userSchema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.genrateAccessToken = function (){
    jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            exiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.genrateRefreshToken = function (){
    jwt.sign(
        {
            _id: this._id,
          
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            exiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",userSchema)