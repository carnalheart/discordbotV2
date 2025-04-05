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

    const hp = character.hp?.max ? `${character.hp.current}/${character.hp.max}` : '0';

    // Get market items and build emoji map
    const marketItems = await MarketItem.find();
    const emojiMap = {};
    marketItems.forEach(item => {
      if (item.name && item.emoji) {
        emojiMap[item.name.toLowerCase()] = item.emoji;
      }
    });

    // Build inventory display
    const inventory = character.inventory || {};
    const inventoryLines = Object.entries(inventory)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => {
        const emoji = emojiMap[name.toLowerCase()] || '';
        return `➺ ${emoji} **${name}** ・x${qty}`;
      });

    const inventoryDisplay = inventoryLines.length > 0 ? inventoryLines.join('\n') : '*No items yet.*';

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
            `➺ **Health Points** ・ ${hp}`
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