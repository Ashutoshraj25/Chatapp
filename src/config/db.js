const mongoose = require("mongoose");

module.exports = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Set it in Render Environment variables.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
};
