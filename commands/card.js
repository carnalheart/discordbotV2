const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

function toTitleCase(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  name: 'card',
  description: 'Displays a character card.',
  async execute(message, args) {
    const name = args[0];
    if (!name) return message.reply('Usage: `.card <character>`');

    const character = await Character.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (!character) return message.reply(`⚠️ Character **${name}** not found.`);

    const stats = character.stats || {};
    const coins = character.coins || {};
    const invList = [];

    for (const entry of character.inventory) {
      const itemName = Object.keys(entry)[0];
      const qty = entry[itemName];
      const itemData = await MarketItem.findOne({ name: { $regex: `^${itemName}$`, $options: 'i' } });
      const emoji = itemData?.emoji || '';
      invList.push(`➺ ${emoji} **${toTitleCase(itemName)}** ・ x${qty}`);
    }

    const embed = {
      title: `― ${character.name}`,
      description: `[Character biography.](${character.bio})`,
      fields: [
        {
          name: 'Statistics',
          value: `**STR** ${stats.str || 0} ・ **DEX** ${stats.dex || 0} ・ **CON** ${stats.con || 0} ・ **INT** ${stats.int || 0} ・ **WIS** ${stats.wis || 0} ・ **CHA** ${stats.char || 0}\n**Health** ${character.hpCurrent}/${character.hpMax}`,
        },
        {
          name: 'Coin Pouch',
          value: `➺ Copper Stars ・ ${coins.copper || 0}\n➺ Silver Stags ・ ${coins.silver || 0}\n➺ Gold Dragons ・ ${coins.gold || 0}`,
        },
        {
          name: 'Inventory',
          value: invList.length ? invList.join('\n') : '*No items yet.*',
        }
      ],
      image: { url: character.image || 'https://i.imgur.com/5c3aNMa.png?quality=lossless' },
      footer: { text: 'This is your character’s roleplay card. Run .help for a detailed list of RPG commands and how to use them.' },
      color: 0x23272A,
    };

    message.channel.send({ embeds: [embed] });
  }
};