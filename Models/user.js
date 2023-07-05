import mongoose from "mongoose";
import crypto from "crypto";

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
      // creates random numbers and letters that will be the token for our log in
      default: () => crypto.randomBytes(128).toString("hex"),
    },
  });
  
  
  const User = mongoose.model("User", UserSchema);

  export default User;