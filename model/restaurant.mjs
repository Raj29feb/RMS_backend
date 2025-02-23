import mongoose from "mongoose";

// Define a schema for users
const restaurantSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
    unique: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
    unique: true,
  },
  longitude: {
    type: Number,
    required: true,
    unique: true,
  },
});

// Create a model for the 'User' collection
export default mongoose.model("restaurant", restaurantSchema);
