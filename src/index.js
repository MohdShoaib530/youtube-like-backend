/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config({
    path: '../.env'
});
import app from './app.js';
import connectToDb from './db/db.js';

connectToDb()
    .then(() => {
        app.on('error',(error) => {
            console.log('Error',error);
            throw error;
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`app is listening on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log('error while connceting to database !!',error);
    });