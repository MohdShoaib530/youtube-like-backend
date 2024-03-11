import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, {Schema} from 'mongoose';

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
            trim: true,
            index: true
        },
        fullName: {
            type:String,
            required: true,
            lowercase: true
        },
        avatar: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        },
        coverImage: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required: [true,'Password is required'],
            select: false
        },
        refreshToken: {
            type:String,
            select: false
        }
    },
    {timestamps: true}
);

userSchema.pre('save', async function (next){
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compareSync(password,this.password);
};

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};


userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const User = mongoose.model('User',userSchema);

export default User;
