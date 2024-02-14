import mongoose from "mongoose";

const connectToDb =  async () => {
    try {
        const {connection} = await mongoose.connect(`${process.env.MONGO_URI}`);

        if(connection){
            console.log(`connected to db name:${connection.name} host:${connection.host} port:${connection.port}`);
        }
    } catch (error) {
        console.log('error while connecting to db',error);
        process.exit(1)
    }
};

export default connectToDb;