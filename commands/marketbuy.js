const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

function formatCurrency(value, currency) {
  const plural = value === 1 ? '' : 's';
  const emojiMap = {
    copper: '<:C_copperstar:1346130043415298118>',
    silver: '<:C_silverstag:1346130090378920066>',
    gold: '<:C_golddragon:1346130130564808795>',
  };
  const labelMap = {
    copper: 'copper star',
    silver: 'silver stag',
    gold: 'gold dragon',
  };
  return `${value} ${labelMap[currency]}${plural} ${emojiMap[currency]}`;
}

function toTitleCase(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  name: 'marketbuy',
  description: 'Purchase an item from the RPG Market.',
  async execute(message, args) {
    const [characterName, itemName, qtyStr] = args;
    const quantity = parseInt(qtyStr);
    if (!characterName || !itemName || isNaN(quantity)) {
      return message.reply('Usage: `.marketbuy <character> <item> <quantity>`');
    }

    const character = await Character.findOne({ name: { $regex: `^${characterName}$`, $options: 'i' } });
    if (!character) {
      return message.reply(`⚠️ Character **${characterName}** not found.`);
    }

    const item = await MarketItem.findOne({ name: { $regex: `^${itemName}$`, $options: 'i' } });
    if (!item) {
      return message.reply(`⚠️ Item **${itemName}** not found in the market.`);
    }

    const totalCostCopper =
      item.currency === 'copper'
        ? item.value * quantity
        : item.currency === 'silver'
        ? item.value * 10 * quantity
        : item.value * 100 * quantity;

    const charTotalCopper = character.coins.copper + (character.coins.silver * 10) + (character.coins.gold * 100);

    if (charTotalCopper < totalCostCopper) {
      return message.reply(`⚠️ ${character.name} does not have enough coins to buy **${quantity} ${toTitleCase(item.name)}${quantity > 1 ? 's' : ''}**.`);
    }

    const remainingCopper = charTotalCopper - totalCostCopper;
    const newGold = Math.floor(remainingCopper / 100);
    const newSilver = Math.floor((remainingCopper % 100) / 10);
    const newCopper = remainingCopper % 10;

    character.coins = { gold: newGold, silver: newSilver, copper: newCopper };

    const existing = character.inventory.find(i => Object.keys(i)[0].toLowerCase() === item.name.toLowerCase());
    if (existing) {
      existing[item.name] += quantity;
    } else {
      character.inventory.push({ [item.name]: quantity });
    }

    await character.save();

    const embed = {
      title: '― Item Purchased!',
      description: `${character.name} purchased **${quantity} ${toTitleCase(item.name)}${quantity > 1 ? 's' : ''}** for **${formatCurrency(item.value * quantity, item.currency)}**. View it in their inventory with \`.card\`.`,
      color: 0x23272A,
    };

    message.channel.send({ embeds: [embed] });
  }
};