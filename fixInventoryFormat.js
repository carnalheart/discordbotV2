const mongoose = require('mongoose');
const Character = require('./models/character');
require('dotenv').config();

async function fixInventories() {
  await mongoose.connect(process.env.MONGO_URI);

  const characters = await Character.find({});
  let updatedCount = 0;
  const skipped = [];

  for (const char of characters) {
    const original = char.inventory;

    // Skip if it's already in object format or empty
    if (!Array.isArray(original) || typeof original[0] === 'object') continue;

    // Check ownerId exists
    if (!char.ownerId) {
      skipped.push(char.name);
      continue;
    }

    const itemMap = {};

    for (const item of original) {
      if (typeof item === 'string') {
        itemMap[item] = (itemMap[item] || 0) + 1;
      }
    }

    const newInventory = Object.entries(itemMap).map(([name, qty]) => ({
      [name]: qty
    }));

    char.inventory = newInventory;

    try {
      await char.save();
      updatedCount++;
    } catch (err) {
      console.error(`❌ Failed to save ${char.name}:`, err.message);
    }
  }

  console.log(`✅ Connected to MongoDB`);
  console.log(`🎉 Finished fixing ${updatedCount} character(s).`);
  if (skipped.length) {
    console.log(`⚠️ Skipped ${skipped.length} character(s) missing ownerId:`, skipped);
  }

  await mongoose.disconnect();
}

fixInventories().catch(err => {
  console.error('❌ Error while fixing inventories:', err);
});