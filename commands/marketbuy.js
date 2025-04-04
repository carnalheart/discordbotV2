const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

const rates = {
  gold: 14700,
  silver: 70,
  copper: 1
};

function convertToCopper(value, currency) {
  return value * rates[currency];
}

module.exports = {
  name: 'marketbuy',
  description: 'Buy an item from the roleplay market',

  async execute(message, args) {
    const [charName, ...rest] = args;
    const quantity = parseInt(rest.pop());
    const itemName = rest.join(' ');

    if (!charName || !itemName || isNaN(quantity) || quantity < 1) {
      return message.channel.send('❌ Usage: `.marketbuy <character> <item> <quantity>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${charName}$`, 'i') });
    if (!character) return message.channel.send(`⚠️ Character **${charName}** not found.`);

    const item = await MarketItem.findOne({ name: new RegExp(`^${itemName}$`, 'i') });
    if (!item || !item.currency || !rates[item.currency]) {
      return message.channel.send(`⚠️ Item **${itemName}** not found or has an invalid currency.`);
    }

    if (!character.coins) {
      character.coins = { gold: 0, silver: 0, copper: 0 };
    } else {
      character.coins.gold = character.coins.gold ?? 0;
      character.coins.silver = character.coins.silver ?? 0;
      character.coins.copper = character.coins.copper ?? 0;
    }

    const totalCostCopper = convertToCopper(item.value, item.currency) * quantity;
    const charTotalCopper =
      character.coins.gold * rates.gold +
      character.coins.silver * rates.silver +
      character.coins.copper;

    if (charTotalCopper < totalCostCopper) {
      return message.channel.send(`⚠️ ${character.name} doesn't have enough money to buy that.`);
    }

    // 💰 Deduct coins top-down (gold → silver → copper)
    let remaining = totalCostCopper;

    // Deduct from gold
    const goldToUse = Math.min(character.coins.gold * rates.gold, remaining);
    const goldCoinsToRemove = Math.floor(goldToUse / rates.gold);
    character.coins.gold -= goldCoinsToRemove;
    remaining -= goldCoinsToRemove * rates.gold;

    // Deduct from silver
    const silverToUse = Math.min(character.coins.silver * rates.silver, remaining);
    const silverCoinsToRemove = Math.floor(silverToUse / rates.silver);
    character.coins.silver -= silverCoinsToRemove;
    remaining -= silverCoinsToRemove * rates.silver;

    // Deduct from copper
    const copperToUse = Math.min(character.coins.copper, remaining);
    character.coins.copper -= copperToUse;
    remaining -= copperToUse;

    // Safety check
    if (remaining > 0) {
      return message.channel.send(`❌ Unexpected error: could not deduct enough coins.`);
    }

    // Add items to inventory
    for (let i = 0; i < quantity; i++) {
      character.inventory.push(item.name);
    }

    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Item Purchased!')
      .setDescription(`${character.name} purchased **${quantity} ${item.name}** for **${item.value * quantity} ${item.currency}**. View it in their inventory with \`.card\`.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};