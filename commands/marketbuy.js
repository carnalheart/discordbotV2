const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'marketbuy',
  description: 'Buy an item from the RPG market',
  async execute(message, args) {
    const [charName, itemName, quantityStr] = args;
    const quantity = parseInt(quantityStr);
    if (!charName || !itemName || isNaN(quantity) || quantity < 1) {
      return message.channel.send('⚠️ Usage: `.marketbuy <character> <item> <quantity>`');
    }

    const character = await Character.findOne({ name: { $regex: new RegExp(`^${charName}$`, 'i') } });
    if (!character) {
      return message.channel.send(`⚠️ Character **${charName}** not found.`);
    }

    const item = await MarketItem.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
    if (!item) {
      return message.channel.send(`⚠️ Item **${itemName}** not found in the market.`);
    }

    const pricePerUnit = item.value;
    const currencyType = item.currency?.toLowerCase();

    if (!['copper', 'silver', 'gold'].includes(currencyType)) {
      return message.channel.send('⚠️ Item currency type is invalid.');
    }

    const priceInCopper =
      currencyType === 'gold' ? pricePerUnit * 10000 :
      currencyType === 'silver' ? pricePerUnit * 100 :
      pricePerUnit;

    const totalCostCopper = priceInCopper * quantity;
    const charCopper = (character.coins.gold || 0) * 10000 +
                       (character.coins.silver || 0) * 100 +
                       (character.coins.copper || 0);

    if (charCopper < totalCostCopper) {
      return message.channel.send(`⚠️ ${character.name} can't afford that purchase.`);
    }

    const remainingCopper = charCopper - totalCostCopper;

    const newGold = Math.floor(remainingCopper / 10000);
    const newSilver = Math.floor((remainingCopper % 10000) / 100);
    const newCopper = remainingCopper % 100;

    character.coins.gold = newGold;
    character.coins.silver = newSilver;
    character.coins.copper = newCopper;

    // ✅ Fix: Add items as an object with quantity, not an array
    if (!character.inventory || typeof character.inventory !== 'object' || Array.isArray(character.inventory)) {
      character.inventory = {}; // Reset malformed inventories
    }

    const itemKey = item.name;
    character.inventory[itemKey] = (character.inventory[itemKey] || 0) + quantity;

    await character.save();

    const currencyDisplay = {
      copper: `copper star${pricePerUnit === 1 ? '' : 's'} <:C_copperstar:1346130043415298118>`,
      silver: `silver stag${pricePerUnit === 1 ? '' : 's'} <:C_silverstag:1346130090378920066>`,
      gold: `gold dragon${pricePerUnit === 1 ? '' : 's'} <:C_golddragon:1346130130564808795>`
    }[currencyType];

    const embed = new EmbedBuilder()
      .setTitle('― Item Purchased!')
      .setDescription(`${character.name} purchased ${quantity} ${item.name} for ${pricePerUnit} ${currencyDisplay}. View it in their inventory with \`.card\`.`)
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};