require('dotenv').config();
const mongoose = require('mongoose');
const MarketItem = require('../models/MarketItem');

const items = [
  {
    name: 'Dagger',
    type: 'weapon',
    rarity: 'rare',
    value: 1,
    currency: 'gold'
  },
  {
    name: 'Medicine',
    type: 'consumable',
    rarity: 'rare',
    value: 5,
    currency: 'silver',
    effect: 'Restores 5HP'
  },
  {
    name: 'Torch',
    type: 'utility',
    rarity: 'common',
    value: 3,
    currency: 'copper'
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🛒 Connected to MongoDB for item seeding.');

    await MarketItem.deleteMany();
    await MarketItem.insertMany(items);

    console.log('✅ Market items seeded!');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('❌ Failed to seed items:', err);
  });