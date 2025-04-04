require('dotenv').config();
const mongoose = require('mongoose');
const MarketItem = require('../models/MarketItem'); // fixed path ✅

const items = [
  {
    name: 'Dagger',
    type: 'weapon',
    rarity: 'rare',
    value: 10
  },
  {
    name: 'Medicine',
    type: 'consumable',
    rarity: 'rare',
    value: 20,
    effect: 'Restores 5HP'
  },
  {
    name: 'Torch',
    type: 'utility',
    rarity: 'common',
    value: 5
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🛒 Connected to MongoDB for item seeding.');

    await MarketItem.deleteMany(); // Optional: Clear old entries
    await MarketItem.insertMany(items);

    console.log('✅ Market items seeded!');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('❌ Failed to seed items:', err);
  });