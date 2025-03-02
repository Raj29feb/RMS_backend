import mongoose from "mongoose";

// Define a schema for users
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
    unique: true,
  },
  longitude: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    required: true,
  },
});

// Create a model for the 'User' collection
export default mongoose.model("User", userSchema);
