import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDB() {
    try {
        console.log("🔍 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to DB");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log("📦 Collections found:", collectionNames.join(", "));

        for (const name of ['users', 'otps', 'fileshares']) {
            if (collectionNames.includes(name)) {
                console.log(`\n--- Collection: ${name} ---`);
                const indexes = await db.collection(name).indexes();
                console.log(`📍 Indices:`, JSON.stringify(indexes, null, 2));

                const count = await db.collection(name).countDocuments();
                console.log(`📊 Total Documents: ${count}`);

                if (count > 0) {
                    const sample = await db.collection(name).findOne();
                    console.log(`📝 Sample Document Keys:`, Object.keys(sample).join(", "));
                }
            } else {
                console.warn(`\n⚠️  Collection '${name}' not found! (It will be created on first use)`);
            }
        }

        console.log("\n✅ Database inspection complete.");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error during DB inspection:", error);
        process.exit(1);
    }
}

checkDB();
