const { EmbedBuilder } = require('discord.js');
const Character = require('../models/marketitem'); // if needed, update to ../models/character
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

    // Log before deduction
    console.log('🧾 transaction log:', {
      item: item.name,
      cost: item.value,
      currency: item.currency,
      quantity,
      totalCostCopper,
      charTotalCopper,
      charCoinsBefore: { ...character.coins }
    });

    // 💰 Deduct from actual coin fields (gold → silver → copper)
    let remaining = totalCostCopper;

    // Deduct gold
    const goldValue = character.coins.gold * rates.gold;
    if (goldValue > 0) {
      const usedGold = Math.min(remaining, goldValue);
      const goldToRemove = Math.floor(usedGold / rates.gold);
      character.coins.gold -= goldToRemove;
      remaining -= goldToRemove * rates.gold;
    }

    // Deduct silver
    const silverValue = character.coins.silver * rates.silver;
    if (silverValue > 0 && remaining > 0) {
      const usedSilver = Math.min(remaining, silverValue);
      const silverToRemove = Math.floor(usedSilver / rates.silver);
      character.coins.silver -= silverToRemove;
      remaining -= silverToRemove * rates.silver;
    }

    // Deduct copper
    if (character.coins.copper >= remaining) {
      character.coins.copper -= remaining;
      remaining = 0;
    } else {
      character.coins.copper = 0;
      remaining = 0; // should never hit this, just safety
    }

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