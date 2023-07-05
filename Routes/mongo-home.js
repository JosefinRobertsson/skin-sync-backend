import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import axios from 'axios';
import authenticateUser from '../Middlewares/middlewares.js';
import User from '../Models/user.js';

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/SkinSync";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Landing page for logged in users
router.get('/userPage', authenticateUser, async (req, res) => {
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
  
  
    const LATITUDE = '60.1282'; // Latitude for Sweden
    const LONGITUDE = '18.6435'; // Longitude for Sweden
  
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/uvi?lat=60.1282&lon=18.6435&appid=c62963aa26b7c860ed01fea29bf9dd34`);
      const uvIndex = response.data.value;
  
      if (user) {
        res.json({
          username: user.username,
          dailyReportLink: "/dailyReport",
          productShelfLink: "/productShelf",
          uvIndex: uvIndex
        });
      } else {
        res.status(403).json({ message: "You must be logged in to see this page" });
      }
    } catch (error) {
      res.status(500).json({ message: "Unable to retrieve UV index at this time" });
    }
  });

  export default router;