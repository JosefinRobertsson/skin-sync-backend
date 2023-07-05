import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import authenticateUser from '../Middlewares/middlewares';
import User from '../Models/user.js';

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/SkinSync";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;


//POST activate or deactivate single product usage  
router.post("/productShelf/logUsage", authenticateUser, async (req, res) => {
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
    }
  });


  //POST handle usage status for all products in a routine
  router.post('/productShelf/toggleAllUsage', authenticateUser, async (req, res) => {
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

// update usedToday to false on new date
router.post("/productShelf/usageReset", authenticateUser, async (req, res) => {
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

export default router;