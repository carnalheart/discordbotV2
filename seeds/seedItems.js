const mongoose = require('mongoose');
const MarketItem = require('../models/marketitem');
require('dotenv').config();

const items = [
  {
    name: 'Dagger',
    type: 'weapon',
    rarity: 'common',
    value: 2,
    currency: 'silver',
    effect: '-1 HP',
    emoji: '<:D_dagger_common:1357703384412721315>',
    description: ''
  },
  {
    name: 'Torch',
    type: 'utility',
    rarity: 'common',
    value: 3,
    currency: 'copper',
    effect: '',
    emoji: '<:D_torch_common:1357699386599145692>',
    description: ''
  },
  {
    name: 'Small Medicine',
    type: 'consumable',
    rarity: 'uncommon',
    value: 25,
    currency: 'copper',
    effect: '+3 HP',
    emoji: '<:D_medicine_uncommon:1357710050625589268>',
    description: ''
  },
  {
    name: 'Medium Medicine',
    type: 'consumable',
    rarity: 'rare',
    value: 5,
    currency: 'silver',
    effect: '+5 HP',
    emoji: '<:D_medicine_rare:1357710107554873497>',
    description: ''
  },
  {
    name: 'Large Medicine',
    type: 'consumable',
    rarity: 'epic',
    value: 200,
    currency: 'silver',
    effect: '+10 HP',
    emoji: '<:D_medicine_epic:1357710189716836386>',
    description: ''
  },
  {
    name: 'longsword',
    type: 'weapon',
    rarity: 'uncommon',
    value: 4,
    currency: 'silver',
    effect: '-2 HP',
    emoji: '<:D_longsword_uncommon:1357703463944851696>',
    description: ''
  },
  {
    name: 'broadsword',
    type: 'weapon',
    rarity: 'rare',
    value: 6,
    currency: 'silver',
    effect: '-3 HP',
    emoji: '<:D_broadsword_rare:1357703544077029496>',
    description: ''
  },
  {
    name: 'arakh',
    type: 'weapon',
    rarity: 'rare',
    value: 5,
    currency: 'silver',
    effect: '-3 HP',
    emoji: '<:D_arakh_epic:1357703647118753892>',
    description: ''
  },
  {
    name: 'axe',
    type: 'utility',
    rarity: 'common',
    value: 3,
    currency: 'silver',
    effect: '-1 HP',
    emoji: '<:D_axe_common:1357702654154768627>',
    description: ''
  },
  {
    name: 'dragonglass sword',
    type: 'weapon',
    rarity: 'legendary',
    value: 2,
    currency: 'gold',
    effect: '-10 HP',
    emoji: '<:D_dragonglass_sword_legendary:1357703706002591754>',
    description: ''
  },
  {
    name: 'fishing rod',
    type: 'utility',
    rarity: 'common',
    value: 60,
    currency: 'copper',
    effect: '',
    emoji: '<:D_fishingrod_common:1357702507627020388>',
    description: ''
  },
  {
    name: 'anchovy',
    type: 'consumable',
    rarity: 'common',
    value: 8,
    currency: 'copper',
    effect: '+1 HP',
    emoji: '<:D_anchovy_common:1357700060342784032>',
    description: ''
  },
  {
    name: 'salmon',
    type: 'consumable',
    rarity: 'uncommon',
    value: 30,
    currency: 'copper',
    effect: '+1 HP',
    emoji: '<:D_salmon_uncommon:1357700102701056210>',
    description: ''
  },
  {
    name: 'trout',
    type: 'consumable',
    rarity: 'rare',
    value: 1,
    currency: 'silver',
    effect: '+1 HP',
    emoji: '<:D_trout_rare:1357700194522763457>',
    description: ''
  },
  {
    name: 'red mullet',
    type: 'consumable',
    rarity: 'epic',
    value: 3,
    currency: 'silver',
    effect: '+1 HP',
    emoji: '<:D_mullet_epic:1357700232972079105>',
    description: ''
  },
  {
    name: 'lionfish',
    type: 'consumable',
    rarity: 'legendary',
    value: 6,
    currency: 'silver',
    effect: '+1 HP',
    emoji: '<:D_lionfish_legendary:1357700425159151656>',
    description: ''
  },
  {
    name: 'rodent meat',
    type: 'consumable',
    rarity: 'common',
    value: 4,
    currency: 'copper',
    effect: '+1 HP',
    emoji: '<:D_rodent_common:1357701150614356200>',
    description: ''
  },
  {
    name: 'rabbit meat',
    type: 'consumable',
    rarity: 'uncommon',
    value: 16,
    currency: 'copper',
    effect: '+1 HP',
    emoji: '<:D_rabbit_uncommon:1357701177118167141>',
    description: ''
  },
  {
    name: 'bird meat',
    type: 'consumable',
    rarity: 'rare',
    value: 32,
    currency: 'copper',
    effect: '+1 HP',
    emoji: '<:D_chicken_rare:1357701261796835540>',
    description: ''
  },
  {
    name: 'pork meat',
    type: 'consumable',
    rarity: 'epic',
    value: 1,
    currency: 'silver',
    effect: '+1 HP',
    emoji: '<:D_pork_epic:1357701278729240675>',
    description: ''
  },
  {
    name: 'venison meat',
    type: 'consumable',
    rarity: 'legendary',
    value: 3,
    currency: 'silver',
    effect: '+1 HP',
    emoji: '<:D_venison_legendary:1357701328184279276>',
    description: ''
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
    console.error('❌ Error seeding items:', err);
    process.exit(1);
  }
})();