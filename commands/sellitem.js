const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const itemDB = require('../data/itemList');

module.exports = {
  name: 'sellitem',
  description: 'Sell an item from a character’s inventory',

  async execute(message, args) {
    const [charName, ...rest] = args;
    const quantity = parseInt(rest.pop());
    const itemName = rest.join(' ');

    if (!charName || !itemName || isNaN(quantity) || quantity <= 0) {
      return message.reply('Usage: `.sellitem <character> <item> <quantity>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${charName}$`, 'i') });
    if (!character) return message.reply(`Character **${charName}** not found.`);

    const inventory = character.inventory || [];
    const itemEntry = inventory.find(i => Object.keys(i)[0].toLowerCase() === itemName.toLowerCase());
    const itemKey = itemEntry ? Object.keys(itemEntry)[0] : null;
    const currentQty = itemEntry ? itemEntry[itemKey] : 0;

    if (!itemEntry || currentQty < quantity) {
      return message.reply(`${character.name} does not have enough of that item.`);
    }

    const item = itemDB.find(i => i.name.toLowerCase() === itemKey.toLowerCase());
    if (!item) return message.reply(`Item **${itemKey}** not found in the market.`);

    // Calculate total sell value
    const totalValue = item.value * quantity;
    const coinType = item.currency.toLowerCase();

    // Safely update coin values (ensure base is a number)
    character.coins[coinType] = Number(character.coins[coinType] || 0) + totalValue;

    // Update inventory
    if (currentQty === quantity) {
      character.inventory = inventory.filter(i => Object.keys(i)[0].toLowerCase() !== itemKey.toLowerCase());
    } else {
      itemEntry[itemKey] -= quantity;
    }

    await character.save();

    // Embed formatting
    const plural = quantity > 1 ? 's' : '';
    const emoji = item.emoji || '';
    const coinEmojis = {
      copper: '<:C_copperstar:1346130043415298118>',
      silver: '<:C_silverstag:1346130090378920066>',
      gold: '<:C_golddragon:1346130130564808795>'
    };

    const embed = new EmbedBuilder()
      .setTitle('― Item Sold!')
      .setDescription(`**${character.name}** sold **${quantity} ${item.name}${plural} ${emoji}** in exchange for **${totalValue} ${coinType} ${coinEmojis[coinType]}**.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};