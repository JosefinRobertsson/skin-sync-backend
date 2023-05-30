import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import e from "express";
import listEndpoints from 'express-list-endpoints';


// i have changed from localhost to 127.0.0.1
// original: "mongodb://localhost/project-mongo";
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/Authentication";
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
// Thoughts
const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String
  },
  createdAt: {
    type: Date,
    //default:0
    default: () => new Date()
  },
  user: {
    type: String,
    required: true
  }
});

const Thought = mongoose.model("Thought", ThoughtSchema)

// Autehnticate the user
const authenticateUser = async (req, res, next) => {
  const accessToken = req.header("Authorization");
  try {
    const user = await User.findOne({ accessToken: accessToken }); // find the user with the access token they send in the header called Authorization
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
    res.status(500).json({
      sucess: false,
      response: e,
      message: "Internal server error", error: e.errors
    });
  }
}

app.get("/thoughts", authenticateUser); // this will run the function authenticateUser before the function below, to make sure the user is logged in
app.get("/thoughts", async (req, res) => {
  try {
    const thougths = await Thought.find({}).populate('user');
    res.status(200).json({
      success: true,
      message: "Retrieved thoughts successfully",
      response: thougths
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      response: e,
      message: "Could not find thoughts"
    });
  }
});

/* From wednesday live session
app.get ("/thoughts", async (req,res) => {
  try {
    const allThoughts = await Thoughts.find(); // leaving find() empty will extract everything from all thoughts
    res.status(200).json({
      success: true,
      response: allThoughts,
      message: "All thoughts found successfully"
    });
  } catch (e) { //if there is an error before we get everything in the try block successfully, the catch block will run
    res.status(400).json({
      success: false,
      response: e,
      message: "Could not find all thoughts"
    });
  }
});
*/

app.post("/thoughts", authenticateUser);
//added try/catch to post thoughts, needs to be tested
app.post("/thoughts", async (req, res) => {
  try {
    const { message } = req.body;
    const accessToken = req.header("Authorization");
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      const thoughts = await new Thought({ message: message, user: user._id }).save();
      res.status(200).json({ success: true, response: thoughts })
    } else {
      res.status(400).json({
        success: false,
        response: e,
        message: "Could not post thought"
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e,
      message: "Internal server error", error: e.errors
    });
  }
});


///////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});