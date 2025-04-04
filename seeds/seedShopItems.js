const mongoose = require('mongoose');
const ShopItem = require('../models/shopitem');
require('dotenv').config();

const items = [
  {
    name: 'Custom Color Role',
    description: 'A fully customizable personal role. Choose the color, name & emoji badge.',
    value: 5000
  },
  {
    name: 'Filler Item',
    description: 'Filler description content.',
    value: 100
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const deleted = await ShopItem.deleteMany({});
    console.log(`🧹 Deleted ${deleted.deletedCount} old shop items`);

    const result = await ShopItem.insertMany(items);
    console.log(`✅ Inserted ${result.length} new shop items:`);
    result.forEach(item => {
      console.log(`- ${item.name} (${item.value} credits)`);
    });

    process.exit();
  } catch (err) {
    console.error('❌ Error seeding shop items:', err);
    process.exit(1);
  }
})();