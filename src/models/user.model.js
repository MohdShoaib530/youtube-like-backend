import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
    {

        username: {
            type:String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type:String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type:String,
            required: true,
            lowercase: true,
            index: true
        },
        avatar: {
            type: String,  // clooudinary url
            required: true,
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true,"Password is required"]
        },
        refreshToken: {
            type:String
        },
    },
    {timestamps: true}
);

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.method.isPasswordCorrct = async function (password){

   return await bcrypt.compare(password,this.password)
}

export default mongoose.model("User",userSchema);
