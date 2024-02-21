import dotenv from 'dotenv';
dotenv.config({
    path: '../.env'
});
import connectToDb from "./db/db.js";
import app from "./app.js";

connectToDb()
.then(() => {
    app.on("error",(error) => {
        console.log("Error",error);
        throw error;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log('Error while connecting to db !!',err);
})