import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import e from "express";
import listEndpoints from 'express-list-endpoints';


// i have changed from localhost to 127.0.0.1
// original: "mongodb://localhost/project-mongo";
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/SkinSync";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();



// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send({
    Welcome: "Welcome to the Authentication app",
    Routes: listEndpoints(app)
  });
});

app.get('/', (req, res) => {
  res.json(routes);
});
///////////////////
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

//user model
const User = mongoose.model("User", UserSchema);

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
// Login
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
    type: Boolean,
    default: false,
    required: true
  },
  period: {
    type: Boolean,
    default: false,
    required: true
  },
  mood: {
    type: String,
    enum: ['Not stressful', 'Under control', 'Stressful', 'Extremely stressful'],
    required: true
  },
  skinCondition: [{
    type: String,
    enum: ['Normal', 'Irritated', 'Dry', 'Oily', 'Dull', 'Itchy', 'With texture', 'Acne'],
    required: true
  }],
  diet: [{
    type: String,
    enum: ['Sugar', 'Fast food', 'Alcohol', 'Dairy', 'Veggies', 'Fruits', 'Meat', 'Grains'],
    required: true
  }],
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
    type: String,
    required: true
  },
  usedToday: {
    type: Boolean,
    default: false
  }
});

const SkincareProduct = mongoose.model("SkincareProduct", SkincareProductSchema);



// Autehnticate the user
const authenticateUser = async (req, res, next) => {
  const accessToken = req.header("Authorization");
  try {
    console.log("accessToken:", accessToken); 
    const user = await User.findOne({ accessToken: accessToken }); // find the user with the access token they send in the header called Authorization
    console.log("user:", user);
    if (user) {
      next();
    } else {
      res.status(403).json({
        sucess: false,
        response: e,
        message: "You must be logged in to see this page"
      })
    }
  } catch (e) {
    console.error("authenticateUser Error:", e);
    res.status(500).json({
      sucess: false,
      response: e,
      message: "Internal server error", error: e.errors
    });
  }
}

// GET endpoint to retrieve logged daily report

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

//  POST endpoint to log the daily report

app.post("/dailyReport", authenticateUser, async (req, res) => {
  try {
    const { exercised, period, mood, skinCondition, diet } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
    console.log("req.body:", req.body); 
    console.log("accessToken:", accessToken); 
    console.log("user:", user);
    if (user) {
      const newDailyReport = await new DailyReport({
        user: user._id,
        exercised,
        period,
        mood,
        skinCondition,
        diet
      }).save();
      console.log("newDailyReport:", newDailyReport); 
      res.status(200).json({ success: true, response: newDailyReport });
    } else {
      res.status(400).json({
        success: false,
        response: e,
        message: "Could not log daily report",
        error: e.message,
      });
    }
  } catch (e) {
    console.error("POST /dailyReport Error:", e); 
    res.status(500).json({
      success: false,
      response: e,
      message: "Internal server error", error: e.errors
    });
  }
});

// POST endpoint to add a new skincare product
app.post("/skincareProduct", authenticateUser, async (req, res) => {
  try {
    const { name, brand } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      const newProduct = await new SkincareProduct({
        user: user._id,
        name,
        brand
      }).save();
      res.status(200).json({ success: true, response: newProduct });
    } else {
      res.status(400).json({ success: false, message: "Could not add product" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// GET endpoint to retrieve all skincare products of a user
app.get("/skincareProduct", authenticateUser, async (req, res) => {
  try {
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      const products = await SkincareProduct.find({ user: user._id });
      res.status(200).json({ success: true, response: products });
    } else {
      res.status(400).json({ success: false, message: "Could not find products" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// DELETE endpoint to delete a skincare product

app.delete("/skincareProduct/:productId", authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("productId:", productId);
    const accessToken = req.header("Authorization");
    console.log("accessToken:", accessToken); 
    const user = await User.findOne({ accessToken: accessToken });
    console.log("user:", user); 

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

///////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});