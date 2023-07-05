import mongoose from "mongoose";

const DailyReportSchema = new mongoose.Schema({
    user: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: () => new Date()
    },
    exercised: {
      type: Number,
      required: true
    },
    period: {
      type: Boolean,
      default: false,
      required: true
    },
    stress: {
      type: Number,
      required: true
    },
    acne: {
      type: Number,
      required: true
    },
    sugar: {
      type: Number,
      required: true
    },
    alcohol: {
      type: Number,
      required: true
    },
    dairy: {
      type: Number,
      required: true
    },
    greasyFood: {
      type: Number,
      required: true
    },
    waterAmount: {
      type: Number,
      required: true
    },
    sleepHours: {
      type: Number,
      required: true
    },
  
  });
  
  const DailyReport = mongoose.model("DailyReport", DailyReportSchema);

    export default DailyReport;