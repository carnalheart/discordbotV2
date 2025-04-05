const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'card',
  description: 'View a character card',
  async execute(message, args) {
    const name = args[0];
    if (!name) return message.reply('Please provide a character name.');

    const character = await Character.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!character) return message.reply(`⚠️ Character **${name}** not found.`);

    const stats = character.stats || {};
    const coins = character.coins || {};
    const inventory = character.inventory || [];

    // Format stats
    const hp = character.hpMax ?? 0;
    const statsField = `➺ **Strength** ・ ${stats.strength || 0}
➺ **Dexterity** ・ ${stats.dexterity || 0}
➺ **Constitution** ・ ${stats.constitution || 0}
➺ **Intelligence** ・ ${stats.intelligence || 0}
➺ **Wisdom** ・ ${stats.wisdom || 0}
➺ **Charisma** ・ ${stats.charisma || 0}
➺ **Health Points** ・ ${hp}`;

    // Format coins
    const coinField = `➺ **Copper Stars** ・ ${coins.copper || 0} <:C_copperstar:1346130043415298118>
➺ **Silver Stags** ・ ${coins.silver || 0} <:C_silverstag:1346130090378920066>
➺ **Gold Dragons** ・ ${coins.gold || 0} <:C_golddragon:1346130130564808795>`;

    // Format inventory
    let inventoryField = '*No items yet.*';
    if (inventory.length > 0) {
      const lines = [];
      for (const itemObj of inventory) {
        const [itemName, quantity] = Object.entries(itemObj)[0];

        const marketItem = await MarketItem.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
        const emoji = marketItem?.emoji || '➺';
        lines.push(`${emoji} **${itemName}** ・x${quantity}`);
      }
      inventoryField = lines.join('\n');
    }

    // Embed
    const embed = new EmbedBuilder()
      .setTitle(`<:servericon:1343229799228899419> ― ${character.name}`)
      .setDescription(`[Character biography.](${character.bio || 'https://discord.com'})`)
      .addFields(
        { name: '__Statistics__', value: statsField },
        { name: '__Coin Pouch__', value: coinField },
        { name: '__Inventory__', value: inventoryField }
      )
      .setImage(character.image || 'https://i.imgur.com/5c3aNMa.png?quality=lossless')
      .setFooter({ text: 'This is your character’s roleplay card. Run .help for a detailed list of RPG commands and how to use them.' })
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};