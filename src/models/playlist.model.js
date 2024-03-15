import mongoose,{Schema} from 'mongoose';satisfies;

const playlistSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    videos: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps});

export const Playlist = mongoose.model('Playlist',playlistSchema);