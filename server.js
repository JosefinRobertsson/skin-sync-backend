import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import listEndpoints from 'express-list-endpoints';
import e from "express";

// -----------------------------------------
// SETUP
// -----------------------------------------

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/SkinSync";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on.
const port = process.env.PORT || 8080;
const app = express();

// Middlewares 
app.use(cors());
app.use(express.json());

// -----------------------------------------
// SCHEMAS AND MODELS
// -----------------------------------------

// User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    // npm install crypto package
    type: String,
    // create randome numbers and letters that will be the token for out log in
    default: () => crypto.randomBytes(128).toString("hex"),
  },
});


const User = mongoose.model("User", UserSchema);

// Daily Report schema 
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
  /*
  mood: {
    type: String,
    enum: ['Not stressful', 'Under control', 'Stressful', 'Extremely stressful'],
    required: true
  },*/
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
  /*
    skinCondition: [{
      type: String,
      enum: ['Normal', 'Irritated', 'Dry', 'Oily', 'Dull', 'Itchy', 'With texture', 'Acne'],
      required: true
    }],
    diet: [{
      type: String,
      enum: ['Sugar', 'Fast food', 'Alcohol', 'Dairy', 'Veggies', 'Fruits', 'Meat', 'Grains'],
      required: true
    }], */

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


// Skincare Schema 

const SkincareProductSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String
  },
  category: {
    type: String,
    enum: ['cleanser', 'moisturizer', 'serum', 'sunscreen', 'other'],
    required: true
  },
  date: {
    type: Date,
    default: () => new Date()
  },
  usedToday: {
    type: Boolean,
    default: false
  },
  routine: {
    type: String,
    enum: ['morning', 'night'],
    required: true
  },
  usageHistory: {
    type: [Date],
    default: []
  }
});

const SkincareProduct = mongoose.model("SkincareProduct", SkincareProductSchema);



// -----------------------------------------
// MIDDLEWARES
// -----------------------------------------
// Autehnticate the user


const authenticateUser = async (req, res, next) => {
  const accessToken = req.header("Authorization");
  try {
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      next();
    } else {
      res.status(403).json({
        success: false,
        response: null,
        message: "You must be logged in to see this page"
      });
    }
  } catch (e) {
    console.error("authenticateUser Error:", e);
    res.status(500).json({
      success: false,
      response: null,
      message: "Internal server error",
      error: e.errors
    });
  }
};

// -----------------------------------------
// ROUTES
// -----------------------------------------


// Root route
app.get("/", (req, res) => {
  res.send({
    Welcome: "Welcome to the Authentication app",
    Routes: listEndpoints(app)
  });
});

app.get('/', (req, res) => {
  res.json(routes);
});

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


// User page route
app.get('/userPage', authenticateUser, async (req, res) => {
  const accessToken = req.header("Authorization");
  const user = await User.findOne({ accessToken: accessToken });

  const axios = require('axios');
  const API_KEY = '0e71885f3a66e20937e994f9d36993a1';
  const LATITUDE = '60.1282'; // Latitude for Sweden
  const LONGITUDE = '18.6435'; // Longitude for Sweden

  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/onecall?lat=${LATITUDE}&lon=${LONGITUDE}&exclude=hourly,daily&appid=${API_KEY}`);
    const uvIndex = response.data.current.uvi;

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



// Statistics route

app.get('/statisticsPage', authenticateUser, async (req, res) => {
  const accessToken = req.header('Authorization');
  const user = await User.findOne({ accessToken: accessToken });
  if (user) {

    res.status(200).json({ message: 'Statistics page accessed successfully' });
  } else {
    res.status(403).json({ message: 'You must be logged in to see this page' });
  }
});




// daily report route
//GET

app.get("/dailyReport", authenticateUser, async (req, res) => {

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

// POST
app.post("/dailyReport", authenticateUser, async (req, res) => {
  try {
    const { exercised, period, waterAmount, sleepHours, stress, acne, greasyFood, dairy, alcohol, sugar } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });

    if (user) {
      // Get the latest report for the user
      const latestReport = await DailyReport.findOne({ user: user._id }).sort({ date: -1 });

      let newDailyReport;
      if (latestReport) {
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



// skincare product ROUTE
//POST

app.post("/productShelf", authenticateUser, async (req, res) => {
  try {
    const { name, brand, category, date, routine, usageHistory } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      const newProduct = await new SkincareProduct({
        user: user._id,
        name,
        brand,
        category,
        date,
        routine,
        usageHistory
      }).save();

      res.status(200).json({ success: true, response: newProduct });
    } else {
      res.status(400).json({ success: false, message: "Could not add product" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT to update a product
app.put("/productShelf/:productId", authenticateUser, async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, brand, category, usedToday, date, routine, usageHistory } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });

    if (user) {
      const updatedProduct = await SkincareProduct.findByIdAndUpdate(
        productId,
        { name, brand, category, usedToday, date, routine, usageHistory },
        { new: true }
      );

      if (updatedProduct) {
        res.status(200).json({ success: true, response: updatedProduct });
      } else {
        res.status(404).json({ success: false, message: "Product not found" });
      }
    } else {
      res.status(400).json({ success: false, message: "Could not update product" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// GET categories to populate dropdown menu
app.get("/categories", authenticateUser, async (req, res) => {
  try {
    const categories = SkincareProduct.schema.path("category").enumValues;
    res.status(200).json({ success: true, categories });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// update usage to false on new date

app.post("/productShelf/usageReset", authenticateUser, async (req, res) => {
  console.log("usage reset happening")
  try {
    const { productId } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });

    if (user) {
      const updatedProduct = await SkincareProduct.findByIdAndUpdate(
        productId,
        { usedToday: false },
        { new: true });

      if (updatedProduct) {
      console.log(updatedProduct)
      res.status(200).json({ success: true, message: "Usage reset completed" });
      } else {
        res.status(404).json({ success: false, message: "Product not found" });
      }
    } else {
      res.status(400).json({ success: false, message: "Reset failed" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//POST Logging product usage  

app.post("/productShelf/logUsage", authenticateUser, async (req, res) => {
  try {
    const { productId, usedToday } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      const product = await SkincareProduct.findById(productId);
      if (!product) {
        res.status(400).json({ success: false, message: "Could not find product", error: e.errors });
      }

      product.usedToday = usedToday;

      if (usedToday) {
        product.usageHistory.push(new Date());
      } else {
        product.usageHistory.pop();
      }
      await product.save();
      res.status(200).json({ success: true, response: product });
    } else {
      res.status(400).json({ success: false, message: "Could not find product" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
    console.error("POST /productShelf/logUsage Error:", e);
    console.error("product category:", e.errors.category);
  }
});

//POST handle all products in a routine

app.post('/productShelf/toggleAllUsage', authenticateUser, async (req, res) => {
  try {
    const { productId, usedToday } = req.body;
    const accessToken = req.header('Authorization');
    const user = await User.findOne({ accessToken: accessToken });

    if (user) {
      const product = await SkincareProduct.findById(productId);
      if (!product) {
        res.status(400).json({ success: false, message: "Could not find product", error: e.errors });
      }

      product.usedToday = usedToday;

      if (usedToday) {
        product.usageHistory.push(new Date());
      } else {
        product.usageHistory.pop();
      }

      await product.save();
      return res.status(200).json({ success: true, response: product });
    } else {
      return res
        .status(400)
        .json({ success: false, message: 'Could not find product' });
    }
  } catch (error) {
    console.error('POST /productShelf/toggleAllUsage Error:', error);
    return res.status(500).json({ success: false });
  }
});




// GET  retrieve all skincare products of a user for the MORNING routine
app.get("/productShelf/morning", authenticateUser, async (req, res) => {
  try {
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      const products = await SkincareProduct.find({ user: user._id, routine: 'morning' });
      res.status(200).json({ success: true, response: products });
    } else {
      res.status(400).json({ success: false, message: "Could not find products" });
    }
  } catch (e) {
    console.error("GET /productShelf/morning Error:", e); // Log any error that occurs during the retrieval process
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// GET  retrieve all skincare products of a user for the NIGTH routine
app.get("/productShelf/night", authenticateUser, async (req, res) => {
  try {
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      const products = await SkincareProduct.find({ user: user._id, routine: 'night' });
      res.status(200).json({ success: true, response: products });
    } else {
      res.status(400).json({ success: false, message: "Could not find products" });
    }
  } catch (e) {
    console.error("GET /productShelf/night Error:", e); // Log any error that occurs during the retrieval process
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// DELETE endpoint to delete a skincare product

app.delete("/productShelf/:productId", authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });

    if (user) {
      await SkincareProduct.findOneAndDelete({ _id: productId, user: user._id });
      res.status(200).json({ success: true, message: "Product deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Could not delete product" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// -----------------------------------------
// SERVER START
// -----------------------------------------


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});