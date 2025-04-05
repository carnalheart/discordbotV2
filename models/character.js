const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  bio: { type: String, default: '' },
  image: { type: String, default: '' },
  stats: {
    strength: Number,
    dexterity: Number,
    constitution: Number,
    intelligence: Number,
    wisdom: Number,
    charisma: Number,
  },
  hp: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  coins: {
    copper: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    gold: { type: Number, default: 0 }
  },
  inventory: {
    type: Map,
    of: Number,
    default: {}
  }
});

module.exports = mongoose.model('Character', characterSchema);