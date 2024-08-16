import { app } from "./app.js";
import connectToDatabase from "./db.connection.js";
import dotenv from "dotenv";

//The path needs to be relative to the folder where you are running you script. In this case I have my script running inside the server folder and my .env is also in the server folder so this path. Say if it was inside src then path would be ./src/.env

dotenv.config();

const url = `${process.env.MONGODB_URL}/${process.env.MONGODB_DB_NAME}`

const startServer = async () => {
    try {
        await connectToDatabase(url);
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server: ', error);
    }
};

startServer();
