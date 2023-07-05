import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../Models/user.js';

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/SkinSync";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Register route

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    //to make sure a password is created
    if (!password) {
      return res.status(400).json({
        success: false,
        response: "Password is required",
      });
    }
    //ensure password is at least 6 characters long
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        response: "Password needs to be at least 6 characters long",
      });
    }
    try {
      const salt = bcrypt.genSaltSync();
      const newUser = await new User({
        username: username,
        password: bcrypt.hashSync(password, salt), // obscure the password
      }).save();
      res.status(201).json({
        success: true,
        response: {
          username: newUser.username,
          id: newUser._id,
          accessToken: newUser.accessToken,
        },
        message: "User created successfully"
      });
    } catch (e) {
      res.status(400).json({
        success: false,
        message: "User already exists",
        response: "Could not create user", error: e.errors
      });
    }
  });

  // Login Route

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      // tell us if the password that user put is the same that we have in the data base
      const user = await User.findOne({ username: username });
  
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({
          success: true,
          response: {
            username: user.username,
            id: user._id,
            accessToken: user.accessToken,
          },
          message: "User logged in successfully"
        });
      } else {
        res.status(400).json({
          success: false,
          response: "Credentials do not match",
          message: "Credentials do not match",
          error: null
        });
      }
    } catch (e) {
      res.status(500).json({
        success: false,
        response: "Internal server error",
        message: "Internal server error",
        error: e.errors
      });
    }
  });
  
  // Logout Route
  
  app.post("/logout", authenticateUser, async (req, res) => {
    const accessToken = req.header("Authorization");
    try {
      const user = await User.findOne({ accessToken: accessToken });
      if (user) {
        user.accessToken = null;
        await user.save();
        res.status(200).json({
          success: true,
          response: null,
          message: "User logged out successfully"
        });
      } else {
        res.status(400).json({
          success: false,
          response: "Could not find user",
          message: "Could not find user",
          error: null
        });
      }
    } catch (e) {
      res.status(500).json({
        success: false,
        response: "Internal server error",
        message: "Internal server error",
        error: e.errors
      });
    }
  });

    export default router;