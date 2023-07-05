import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import authenticateUser from '../Middlewares/middlewares';
import User from '../Models/user.js';

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/SkinSync";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

//Access statistics page
router.get('/statisticsPage', authenticateUser, async (req, res) => {
    const accessToken = req.header('Authorization');
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
  
      res.status(200).json({ message: 'Statistics page accessed successfully' });
    } else {
      res.status(403).json({ message: 'You must be logged in to see this page' });
    }
  });

  export default router;