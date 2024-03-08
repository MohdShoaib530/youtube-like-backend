/* eslint-disable no-console */
import mongoose from 'mongoose';

const connectToDb = async () => {
    try {
        const {connection} = await mongoose.connect(`${process.env.MONGO_URI}`);

        if(connection){
            // eslint-disable-next-line no-console
            console.log(`Database connected successfully, db name ${connection.name}, host: ${connection.host}, connction port: ${connection.port}`);
        }
    } catch (error) {
        console.log('Error while connecting to database',error);
        process.exit(1);
    }
};

export default connectToDb;