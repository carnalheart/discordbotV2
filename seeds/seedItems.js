const mongoose = require('mongoose');
const MarketItem = require('../models/MarketItem');
require('dotenv').config();

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

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await MarketItem.deleteMany({});
    console.log('🧼 Cleared old market items');

    await MarketItem.insertMany(items);
    console.log('✅ New market items inserted');

    process.exit();
  } catch (err) {
    console.error('❌ Error seeding market items:', err);
    process.exit(1);
  }
})();