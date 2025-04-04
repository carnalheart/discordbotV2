const mongoose = require('mongoose');

const MarketItemSchema = new mongoose.Schema({
  name: String,
  type: String,
  rarity: String,
  value: Number,
  currency: String,
  effect: String,
  emoji: String,
  description: String
});

module.exports = mongoose.model('MarketItem', MarketItemSchema);