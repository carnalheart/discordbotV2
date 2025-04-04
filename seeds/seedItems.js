const mongoose = require('mongoose');
const MarketItem = require('../models/marketitem');
require('dotenv').config();

const items = [
  {
    name: 'Dagger',
    type: 'weapon',
    rarity: 'rare',
    value: 1,
    currency: 'gold',
    emoji: '<:D_dagger_common:1357703384412721315>',
    description: 'A short, sharp blade perfect for close combat.'
  },
  {
    name: 'Medicine',
    type: 'consumable',
    rarity: 'rare',
    value: 5,
    currency: 'silver',
    effect: 'Restores 5HP',
    emoji: '<:D_medicine_rare:1357710107554873497>',
    description: 'A rare medicinal mixture for stabilizing wounds.'
  },
  {
    name: 'Torch',
    type: 'utility',
    rarity: 'common',
    value: 3,
    currency: 'copper',
    emoji: '<:D_torch_common:1357699386599145692>',
    description: 'A basic light source for exploring dark places.'
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const deleted = await MarketItem.deleteMany({});
    console.log(`🧹 Deleted ${deleted.deletedCount} old market items`);

    const result = await MarketItem.insertMany(items);
    console.log(`✅ Inserted ${result.length} new items:`);
    result.forEach(item => {
      console.log(`- ${item.name} (${item.currency}, ${item.value})`);
    });

    process.exit();
  } catch (err) {
    console.error('❌ Error seeding market items:', err);
    process.exit(1);
  }
})();