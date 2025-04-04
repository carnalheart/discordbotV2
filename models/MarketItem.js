const mongoose = require('mongoose');

const MarketItemSchema = new mongoose.Schema({
  name: String,
  type: String,
  rarity: String,
  value: Number,
  currency: String, // ✅ THIS MUST EXIST
  effect: String // optional
});

module.exports = mongoose.model('MarketItem', MarketItemSchema);