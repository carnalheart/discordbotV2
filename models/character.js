const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  ownerId: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  stats: {
    strength: { type: Number, default: 0 },
    dexterity: { type: Number, default: 0 },
    constitution: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    wisdom: { type: Number, default: 0 },
    charisma: { type: Number, default: 0 }
  },
  hpMax: {
    type: Number,
    default: 0
  },
  hpCurrent: {
    type: Number,
    default: 0
  },
  coins: {
    copper: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    gold: { type: Number, default: 0 }
  },
  inventory: {
    type: [Object],
    default: []
  }
});

module.exports = mongoose.model('Character', characterSchema);