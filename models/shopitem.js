const mongoose = require('mongoose');

const ShopItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  value: Number // in server credits
});

module.exports = mongoose.model('ShopItem', ShopItemSchema);