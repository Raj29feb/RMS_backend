import express from "express";
const app = express();
app.use(express.json());
import jwt from "jsonwebtoken";
import user from "./model/user.mjs";
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
import address from "./model/address.mjs";
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
app.post("/add-address", validateJWT, async (req, res) => {
  try {
    req.body.map((data) => (data.userId = req.user));
    const newAddress = await address.create(req.body);
    if (!newAddress) {
      return res.status(400).json({ message: "Unable to create the address" });
    }
    return res
      .status(201)
      .json({ message: "Address created successfully", data: newAddress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/get-address", validateJWT, async (req, res) => {
  try {
    const data = await address.find();
    if (!data) {
      return res
        .status(400)
        .json({ message: "Unable to retrive the addresses" });
    }
    return res.status(200).json({ data });
  } catch (error) {}
});

app.listen(3000, () => {
  console.log("Server is runing on port 3000");
});
