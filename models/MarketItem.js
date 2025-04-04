const mongoose = require('mongoose');

const marketItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g. weapon, consumable, etc
  rarity: { type: String, required: true }, // e.g. common, rare, etc
  value: { type: Number, required: true }, // in coppers only
  effect: { type: String } // optional (e.g. restores 5HP)
});

module.exports = mongoose.model('MarketItem', marketItemSchema);