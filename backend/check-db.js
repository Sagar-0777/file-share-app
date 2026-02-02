import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        const usersInfo = await db.listCollections({ name: 'users' }).toArray();
        if (usersInfo.length > 0) {
            console.log("Users Collection Info:", JSON.stringify(usersInfo[0], null, 2));
        }

        const indexes = await db.collection('users').indexes();
        console.log("Users Indexes:", JSON.stringify(indexes, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkDB();
