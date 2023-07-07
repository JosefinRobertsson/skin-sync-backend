import mongoose from "mongoose";

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
      enum: ['body lotion', 'cleanser', 'herbal remedy', 'mist', 'moisturizer', 'oil', 'peeling', 'serum', 'soap', 'spot-treatment', 'sunscreen', 'other'],
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
    },
    archived: {
      type: Boolean,
      default: false
    },
    archivedAt: {
      type: Date,
      default: () => new Date()
    },
    favorite: {
      type: Boolean,
      default: false
    }
  });
  
  const SkincareProduct = mongoose.model("SkincareProduct", SkincareProductSchema);

    export default SkincareProduct;