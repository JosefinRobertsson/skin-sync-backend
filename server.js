import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from 'express-list-endpoints';


// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();


//Import routes, to connect with files in Routes folder
import mongoUsersRoute from './Routes/mongo-users.js';
import mongoHomeRoute from './Routes/mongo-home.js';
import mongoDailyReportRoute from './Routes/mongo-dailyreport.js';
import mongoProductShelfRoute from './Routes/mongo-productShelf-products.js';
import mongoProductUsageRoute from './Routes/mongo-productShelf-usage.js';
import mongoStatisticsRoute from './Routes/mongo-statistics.js';


// Middlewares 
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service currently unavailable' })
  }
});


//Adding the routes files to the app
app.use("/", mongoUsersRoute);
app.use("/", mongoHomeRoute);
app.use("/", mongoDailyReportRoute);
app.use("/", mongoProductShelfRoute);
app.use("/", mongoProductUsageRoute);
app.use("/", mongoStatisticsRoute);


// Root route
app.get("/", (req, res) => {
  res.send({
    Welcome: "This is a SkinSync app server",
    Routes: listEndpoints(app)
  });
});

app.get('/', (req, res) => {
  res.json(routes);
});

// -----------------------------------------
// SERVER START
// -----------------------------------------


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});