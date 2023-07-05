import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import authenticateUser from '../Middlewares/middlewares';
import User from '../Models/user.js';

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/SkinSync";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;


// GET categories to populate dropdown menu and show correct icon
app.get("/categories", authenticateUser, async (req, res) => {
    try {
      const categories = SkincareProduct.schema.path("category").enumValues;
      res.status(200).json({ success: true, categories });
    } catch (e) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });


  //POST to create a new skincare product
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


  // PUT to update an existing product
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


// GET retrieve all skincare products of a user for the MORNING routine
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
      console.error("GET /productShelf/morning Error:", e); 
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
  
  // GET retrieve all skincare products of a user for the NIGTH routine
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


  // DELETE to delete a skincare product
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

  export default router;