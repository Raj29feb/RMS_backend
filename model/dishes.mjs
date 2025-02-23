import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the Dish Schema
const dishSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Trims any extra spaces from the input
      minlength: [3, "Dish name must be at least 3 characters long"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    userId: {
      type: String,
      required: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive value"],
    },
    category: {
      type: String,
      enum: ["Appetizer", "Main Course", "Dessert", "Drink", "Side Dish"],
      required: true,
    },
    ingredients: {
      type: [String],
      required: true, // An array of ingredients (could be simple strings)
      validate: {
        validator: function (v) {
          return v.length > 0; // Ingredients cannot be empty
        },
        message: "A dish must have at least one ingredient.",
      },
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String, // URL or path to the image of the dish
      trim: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant", // Reference to the Restaurant schema
      required: true,
    },
    available: {
      type: Boolean,
      default: true, // Dish availability status
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create a model from the schema
export default mongoose.model("Dish", dishSchema);
