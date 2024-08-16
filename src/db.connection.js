import mongoose from 'mongoose';

async function connectToDatabase(url) {
    try {
        await mongoose.connect(url);
        console.log('Successfully connected to the database');
    } catch (error) {
        console.error('Error connecting to the database: ', error);
    }
}

export default connectToDatabase;
