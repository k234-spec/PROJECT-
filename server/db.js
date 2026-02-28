const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

let connected = false;

const connect = async () => {
  if (connected) return;
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    connected = true;
    console.log(" MongoDB connected:", MONGODB_URI.split("@").pop() || MONGODB_URI);
  } catch (err) {
    console.log(" Local MongoDB not found, starting In-Memory MongoDB Server...");
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      connected = true;
      console.log(" In-Memory MongoDB connected:", uri);
    } catch (memErr) {
      console.error(" MongoDB connection error:", memErr.message);
      process.exit(1);
    }
  }
};

module.exports = { connect, mongoose };

