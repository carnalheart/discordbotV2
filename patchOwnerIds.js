const mongoose = require('mongoose');
const Character = require('./models/character');
require('dotenv').config();

async function patchOwnerIds() {
  await mongoose.connect(process.env.MONGO_URI);

  const updates = {
    Meralith: '1201171702038663312',
    Vaelarys: '1201171702038663312',
    Eddric: '554324755784925205',
    Debug: '1201171702038663312'
  };

  let updated = 0;

  for (const [name, ownerId] of Object.entries(updates)) {
    const character = await Character.findOne({ name });
    if (!character) {
      console.log(`❌ Character not found: ${name}`);
      continue;
    }

    character.ownerId = ownerId;
    await character.save();
    console.log(`✅ Patched ${name} with owner ID ${ownerId}`);
    updated++;
  }

  console.log(`🎉 Successfully patched ${updated} character(s).`);
  await mongoose.disconnect();
}

patchOwnerIds().catch(err => {
  console.error('❌ Error patching characters:', err);
});