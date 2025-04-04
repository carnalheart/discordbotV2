const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'card',
  description: 'View a character card',

  async execute(message, args) {
    const name = args[0];
    if (!name) return message.channel.send('Please specify a character name.');

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!character) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('⚠️ Character Not Found.')
            .setDescription(`No character named **${name}** was found.`)
            .setColor('#23272A')
        ]
      });
    }

    const allItems = await MarketItem.find();
    const emojiMap = Object.fromEntries(allItems.map(item => [item.name.toLowerCase(), item.emoji || '']));

    const stats = character.stats || {};
    const healthPoints = character.hp?.current ?? 0;
    const inventory = character.inventory || {};
    const coins = character.coins || { copper: 0, silver: 0, gold: 0 };

    const inventoryDisplay = Object.keys(inventory).length
      ? Object.entries(inventory).map(([itemName, qty]) => {
          const emoji = emojiMap[itemName.toLowerCase()] || '';
          return `➺ ${emoji} **${itemName}** ・x${qty}`;
        }).join('\n')
      : '*No items yet.*';

    const statsDisplay = `__Statistics__\n` +
      `➺ **Strength** ・ ${stats.strength || 0}\n` +
      `➺ **Dexterity** ・ ${stats.dexterity || 0}\n` +
      `➺ **Constitution** ・ ${stats.constitution || 0}\n` +
      `➺ **Intelligence** ・ ${stats.intelligence || 0}\n` +
      `➺ **Wisdom** ・ ${stats.wisdom || 0}\n` +
      `➺ **Charisma** ・ ${stats.charisma || 0}\n` +
      `➺ **Health Points** ・ ${healthPoints}`;

    const coinsDisplay = `__Coin Pouch__\n` +
      `➺ **Copper Stars** ・ ${coins.copper || 0} <:C_copperstar:1346130043415298118>\n` +
      `➺ **Silver Stags** ・ ${coins.silver || 0} <:C_silverstag:1346130090378920066>\n` +
      `➺ **Gold Dragons** ・ ${coins.gold || 0} <:C_golddragon:1346130130564808795>`;

    const embed = new EmbedBuilder()
      .setTitle(`<:servericon:1343229799228899419> ― ${character.name}`)
      .setDescription(`[Character biography.](${character.bio || 'https://i.imgur.com/5c3aNMa.png?quality=lossless'})`)
      .addFields(
        { name: '\u200B', value: statsDisplay },
        { name: '\u200B', value: coinsDisplay },
        { name: '__Inventory__', value: inventoryDisplay }
      )
      .setImage(character.image || 'https://i.imgur.com/5c3aNMa.png?quality=lossless')
      .setFooter({ text: 'This is your character’s roleplay card. Run .help for a detailed list of RPG commands and how to use them.' })
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};