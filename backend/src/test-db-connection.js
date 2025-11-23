import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
    try {
        console.log("🔍 Testing MongoDB connection...");
        console.log(`📍 URI: ${process.env.MONGO_URI}`);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ Successfully connected to MongoDB!");
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        console.log(`🔌 Port: ${mongoose.connection.port}`);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📁 Collections (${collections.length}):`);
        if (collections.length === 0) {
            console.log("   No collections yet. They will be created when you insert data.");
        } else {
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
        }

        await mongoose.connection.close();
        console.log("\n✅ Connection test completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ MongoDB connection failed!");
        console.error("Error:", error.message);
        console.log("\n💡 Troubleshooting:");
        console.log("1. Make sure MongoDB is installed and running");
        console.log("2. Check if MongoDB service is started: Get-Service MongoDB");
        console.log("3. Start MongoDB service: Start-Service MongoDB");
        console.log("4. Verify .env file has: MONGO_URI=mongodb://localhost:27017/shareApp");
        console.log("\n📖 See MONGODB_SETUP.md for detailed installation instructions");
        process.exit(1);
    }
};

testConnection();
