import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import authenticateUser from '../Middlewares/middlewares';
import DailyReport from '../Models/dailyReport.js';
import User from '../Models/user.js';

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/SkinSync";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;


// Get saved daily reports
router.get("/dailyReport", authenticateUser, async (req, res) => {

    try {
      const accessToken = req.header("Authorization");
      const user = await User.findOne({ accessToken: accessToken });
      if (user) {
        const dailyReports = await DailyReport.find({ user: user._id });
        res.status(200).json({
          success: true,
          message: "Retrieved daily reports successfully",
          response: dailyReports
        });
      } else {
        res.status(400).json({
          success: false,
          response: e,
          message: "Could not find daily reports"
        });
      }
    } catch (e) {
      console.error("GET /dailyReport Error:", e);
      res.status(500).json({
        success: false,
        response: e,
        message: "Internal server error", error: e.errors
      });
    }
  });


  //Post a daily report
  router.post("/dailyReport", authenticateUser, async (req, res) => {
    try {
      const { exercised, period, waterAmount, sleepHours, stress, acne, greasyFood, dairy, alcohol, sugar } = req.body;
      const accessToken = req.header("Authorization");
      const user = await User.findOne({ accessToken: accessToken });
  
      if (user) {
        // Get the latest report for the user
        const latestReport = await DailyReport.findOne({ user: user._id }).sort({ date: -1 });
  
        let newDailyReport;
        const currentDate = new Date().toISOString().split('T')[0];
  
        if (latestReport && latestReport.date.toISOString().split('T')[0] === currentDate) {
          // Update the existing report
          latestReport.exercised = exercised;
          latestReport.period = period;
          latestReport.stress = stress;
          latestReport.acne = acne;
          latestReport.greasyFood = greasyFood;
          latestReport.dairy = dairy;
          latestReport.alcohol = alcohol;
          latestReport.sugar = sugar;
          latestReport.waterAmount = waterAmount;
          latestReport.sleepHours = sleepHours;
          newDailyReport = await latestReport.save();
        } else {
          // Create a new report
          newDailyReport = await new DailyReport({
            user: user._id,
            exercised,
            period,
            stress,
            acne,
            greasyFood,
            dairy,
            alcohol,
            sugar,
            waterAmount,
            sleepHours
          }).save();
        }
        /* for adding test data, also add "date" in req.body
        if (user) {
          const newDailyReport = await new DailyReport({
            user: user._id,
            exercised,
            period,
            stress,
            acne,
            greasyFood,
            dairy,
            alcohol,
            sugar,
            waterAmount,
            sleepHours,
            date
          }).save();*/
    
  
        res.status(200).json({ success: true, response: newDailyReport });
      } else {
        res.status(400).json({
          success: false,
          message: "Could not log daily report",
        });
      }
    } catch (e) {
      console.error("POST /dailyReport Error:", e);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });
  
  export default router;