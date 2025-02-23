import express from "express";
const app = express();
app.use(express.json());
import jwt from "jsonwebtoken";
import user from "./model/user.mjs";
import dish from "./model/dishes.mjs";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

app.use(cors());

const generateToken = (userId) => {
  //pass the userId
  const payload = { userId }; // the payload can be any data you need to embed in the token
  const options = { expiresIn: "1h" }; // token expiration time

  const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  return token;
};

//making database connection

// Import mongoose
import mongoose from "mongoose";
import restaurant from "./model/restaurant.mjs";
import validateJWT from "./middleware/validate-jwt.mjs";

// Define the MongoDB URI (connection string)
const mongoURI = "mongodb://localhost:27017/rms"; // Replace 'mydatabase' with your DB name

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await user.findOne({ email, password }, { password: 0 });
    if (!foundUser) {
      return res
        .status(404)
        .json({ message: "Can't find matching credentials" });
    }
    // generating token
    const userId = foundUser._id;
    const token = generateToken(userId);
    res
      .status(200)
      .json({ message: "User logged in successfully", data: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    function generateRandomLocation() {
      // Generate random latitude between -90 and 90
      const latitude = (Math.random() * 180 - 90).toFixed(6); // Fixed to 6 decimal places

      // Generate random longitude between -180 and 180
      const longitude = (Math.random() * 360 - 180).toFixed(6); // Fixed to 6 decimal places

      return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
    }
    const { latitude, longitude } = generateRandomLocation();
    req.body.latitude = latitude;
    req.body.longitude = longitude;
    const newUser = await user.create(req.body);
    if (!newUser) {
      return res.status(400).json({ message: "Unable to create the user" });
    }
    res
      .status(200)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/username", validateJWT, async (req, res) => {
  try {
    const foundUser = await user.findById(req.user, { username: 1 });
    if (!foundUser) {
      return res.status(400).json({ message: "Unable to get the user" });
    }
    res.status(200).json({ data: foundUser.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post("/add-restaurant", validateJWT, async (req, res) => {
  try {
    //look out for the username
    const foundUser = await user.findById(req.user, { username: 1, _id: 0 });
    if (!foundUser) {
      return res.status(400).json({ message: "Unable to get the user" });
    }
    req.body.map((data) => {
      (data.userId = req.user), (data.owner = foundUser.username);
    });
    const newRestaurant = await restaurant.create(req.body);
    if (!newRestaurant) {
      return res
        .status(400)
        .json({ message: "Unable to create the restaurant" });
    }
    return res.status(201).json({
      message: "Restaurant created successfully",
      data: newRestaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/restaurants/:owner", validateJWT, async (req, res) => {
  try {
    let data;
    if (!req.params.owner) {
      return res.status(400).json({ message: "Owner is required" });
    } else if (req.params.owner === "all") {
      data = await restaurant.find();
    } else if (req.params.owner === "self") {
      data = await restaurant.find({ userId: req.user });
      console.log("data::", data);
    } else {
      data = await restaurant.find({ owner: req.params.owner });
    }
    if (!data.length > 0) {
      return res.status(404).json({ message: "No restaurant found" });
    }
    return res.status(200).json({ data });
  } catch (error) {}
});

app.get("/restaurant/:id", validateJWT, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "Restaurant id is required" });
    }
    const data = await restaurant.findById(req.params.id);
    if (!data) {
      return res
        .status(400)
        .json({ message: "Unable to retrive the restaurants" });
    }
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.delete("/restaurant/:id", validateJWT, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "Restaurant id is required" });
    }
    const data = await restaurant.findById(req.params.id);
    if (!data) {
      return res
        .status(400)
        .json({ message: "Unable to retrive the restaurants" });
    }
    return res.status(200).json({ data });
  } catch (error) {}
});
app.get("/dish/:id", validateJWT, async (req, res) => {
  try {
    const foundDish = await dish.findById(req.params.id);
    if (!foundDish) {
      return res.status(400).json({ message: "Unable to get the dish" });
    }
    return res.status(200).json({ data: foundDish });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post("/add-dishes", validateJWT, async (req, res) => {
  try {
    console.log("orignal body::", req.user);
    const foundUser = await user.findById(req.user, { username: 1, _id: 0 });
    if (!foundUser) {
      return res.status(400).json({ message: "Unable to get the user" });
    }

    for (const dish of req.body) {
      const foundRestaurant = await restaurant.findOne({
        _id: dish.restaurantId,
        userId: req.user,
      });

      // If a matching restaurant is found, send an error response
      if (!foundRestaurant) {
        return res.status(400).json({
          message: `Can't add dish to someone else's restaurant ${dish.restaurantName}`,
        });
      }
    }
    req.body.map((restaurant) => (restaurant.userId = req.user));

    console.log("altered body::", req.body);

    // 5. Insert the new dishes into the 'Dish' collection
    const newDishes = await dish.insertMany(req.body); // Multiple dishes inserted
    if (!newDishes || newDishes.length === 0) {
      return res.status(400).json({ message: "Unable to add dishes" });
    }

    return res.status(201).json({
      message: "Dishes added successfully",
      data: newDishes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/restaurant-names/:filter", validateJWT, async (req, res) => {
  try {
    let data;
    if (req.params.filter === "specific") {
      data = await restaurant.find({ userId: req.user }, { restaurantName: 1 });
    } else if (req.params.filter === "all") {
      data = await restaurant.find({}, { restaurantName: 1 });
    } else {
      return res
        .status(404)
        .json({ message: "Please send filter either all or specific" });
    }
    if (!data) {
      return res
        .status(400)
        .json({ message: "Unable to retrive the restaurants names" });
    }
    return res.status(200).json({ data });
  } catch (error) {}
});
app.get("/distances", validateJWT, async (req, res) => {
  try {
    const { latitude, longitude } = await user.findById(req.user, {
      latitude: 1,
      longitude: 1,
    });
    console.log("latitude and longitude are::", latitude, longitude);
    const result = [];
    const data = await restaurant.find();
    console.log("restaurant::", data);
    if (!data) {
      return res.status(404).json({ message: "No restaurant found" });
    }
    data.forEach((value) => {
      // Radius of the Earth in kilometers
      let R = 6371;

      // Convert degrees to radians
      let radLat1 = degToRad(value.latitude);
      let radLon1 = degToRad(value.longitude);
      let radLat2 = degToRad(latitude);
      let radLon2 = degToRad(longitude);

      // Haversine formula
      let dLat = radLat2 - radLat1;
      let dLon = radLon2 - radLon1;

      let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(radLat1) *
          Math.cos(radLat2) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      // Distance in kilometers
      let distance = (R * c).toFixed(2) + " km";
      result.push({ restaurant: value.restaurantName, distance });
    });

    // Helper function to convert degrees to radians
    function degToRad(degrees) {
      return degrees * (Math.PI / 180);
    }
    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
app.get("/dishes/:restaurantId", validateJWT, async (req, res) => {
  try {
    let foundDishes = [];
    if (!req.params.restaurantId) {
      return res.status(400).json({ message: "Restaurant Id is required" });
    } else if (req.params.restaurantId === "all") {
      foundDishes = await dish.find();
    } else if (req.params.restaurantId === "self") {
      foundDishes = await dish.find({ userId: req.user });
    } else {
      foundDishes = await dish.find({
        restaurantId: req.params.restaurantId,
      });
    }
    if (!foundDishes.length > 0) {
      return res.status(404).json({ message: "No dishes found" });
    }
    res.status(200).json({ data: foundDishes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is runing on port 3000");
});
