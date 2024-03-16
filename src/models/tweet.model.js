import mongoose,{Schema} from 'mongoose';

const tweetSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    content: {
        type:String,
        required: true
    }
},{timestamps: true});

const Tweet = mongoose.model('Tweet',tweetSchema);
export default Tweet;