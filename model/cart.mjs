import mongoose from "mongoose";
const Schema = mongoose.Schema;

//define schema for cart item
const cartItemSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: "restaurant",
    required: true,
  },
  dishId: { type: Schema.Types.ObjectId, ref: "Dish", required: true },

  itemTotal: {
    type: Number,
    required: true,
  },
});

// Define a schema for cart
const cartSchema = new mongoose.Schema(
  {
    items: {
      type: [cartItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a model for the 'User' collection
export default mongoose.model("Cart", cartSchema);
