const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'card',
  description: 'Displays the character card',
  async execute(message, args) {
    const charName = args[0];
    if (!charName) {
      return message.channel.send('⚠️ You must provide a character name.');
    }

    const character = await Character.findOne({ name: { $regex: new RegExp(`^${charName}$`, 'i') } });
    if (!character) {
      return message.channel.send(`⚠️ Character **${charName}** not found.`);
    }

    // HP
    const hpDisplay = character.hp?.current && character.hp?.max
      ? `${character.hp.current}/${character.hp.max}`
      : '0';

    // Load market item info for inventory display
    const inventoryEntries = Object.entries(character.inventory || {});
    let inventoryDisplay = '*No items yet.*';

    if (inventoryEntries.length > 0) {
      const marketItems = await MarketItem.find();
      const emojiMap = Object.fromEntries(marketItems.map(item => [item.name.toLowerCase(), item.emoji || '']));

      inventoryDisplay = inventoryEntries.map(([itemName, qty]) => {
        const emoji = emojiMap[itemName.toLowerCase()] || '';
        return `➺ ${emoji} **${itemName}** ・x${qty}`;
      }).join('\n');
    }

    const embed = new EmbedBuilder()
      .setTitle(`<:servericon:1343229799228899419> ― ${character.name}`)
      .setDescription(`[Character biography.](${character.bio || 'https://example.com'})`)
      .addFields(
        {
          name: '__Statistics__',
          value:
            `➺ **Strength** ・ ${character.stats?.strength || 0}\n` +
            `➺ **Dexterity** ・ ${character.stats?.dexterity || 0}\n` +
            `➺ **Constitution** ・ ${character.stats?.constitution || 0}\n` +
            `➺ **Intelligence** ・ ${character.stats?.intelligence || 0}\n` +
            `➺ **Wisdom** ・ ${character.stats?.wisdom || 0}\n` +
            `➺ **Charisma** ・ ${character.stats?.charisma || 0}\n` +
            `➺ **Health Points** ・ ${hpDisplay}`
        },
        {
          name: '__Coin Pouch__',
          value:
            `➺ **Copper Stars** ・ ${character.coins?.copper || 0} <:C_copperstar:1346130043415298118>\n` +
            `➺ **Silver Stags** ・ ${character.coins?.silver || 0} <:C_silverstag:1346130090378920066>\n` +
            `➺ **Gold Dragons** ・ ${character.coins?.gold || 0} <:C_golddragon:1346130130564808795>`
        },
        {
          name: '__Inventory__',
          value: inventoryDisplay
        }
      )
      .setImage(character.image || 'https://i.imgur.com/5c3aNMa.png?quality=lossless')
      .setFooter({ text: 'This is your character’s roleplay card. Run .help for a detailed list of RPG commands and how to use them.' })
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};
