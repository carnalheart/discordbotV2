const mongoose = require('mongoose');
const Character = require('./models/character'); // adjust path if needed
require('dotenv').config();

async function fixInventories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const characters = await Character.find();

    let fixedCount = 0;

    for (const character of characters) {
      if (Array.isArray(character.inventory)) {
        const fixedInventory = {};

        for (const itemName of character.inventory) {
          if (typeof itemName === 'string') {
            fixedInventory[itemName] = (fixedInventory[itemName] || 0) + 1;
          }
        }

        character.inventory = fixedInventory;
        await character.save();
        fixedCount++;
        console.log(`🛠 Fixed inventory for: ${character.name}`);
      }
    }

    console.log(`\n🎉 Finished fixing ${fixedCount} character(s).\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error while fixing inventories:', err);
    process.exit(1);
  }
}

fixInventories();