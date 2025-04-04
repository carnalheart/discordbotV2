const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/MarketItem');

const rates = {
  gold: 14700,
  silver: 70,
  copper: 1
};

function convertToCopper(value, currency) {
  return value * rates[currency];
}

function breakdownCopper(totalCopper) {
  if (isNaN(totalCopper) || totalCopper < 0) return { gold: 0, silver: 0, copper: 0 };

  const gold = Math.floor(totalCopper / rates.gold);
  const remainingAfterGold = totalCopper % rates.gold;
  const silver = Math.floor(remainingAfterGold / rates.silver);
  const copper = remainingAfterGold % rates.silver;

  return {
    gold: Number.isFinite(gold) ? gold : 0,
    silver: Number.isFinite(silver) ? silver : 0,
    copper: Number.isFinite(copper) ? copper : 0
  };
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
    if (!item) return message.channel.send(`⚠️ Item **${itemName}** not found in the market.`);

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

    const remainingCopper = charTotalCopper - totalCostCopper;
    const change = breakdownCopper(remainingCopper);

    // 🔍 transaction log for debugging
    console.log('🧾 transaction log:', {
      item: item.name,
      cost: item.value,
      currency: item.currency,
      quantity,
      totalCostCopper,
      charTotalCopper,
      remainingCopper,
      change,
      charCoinsBefore: character.coins
    });

    if (charTotalCopper < totalCostCopper || totalCostCopper <= 0) {
      return message.channel.send(`⚠️ ${character.name} doesn't have enough money to buy that.`);
    }

    if (
      typeof change.gold !== 'number' ||
      typeof change.silver !== 'number' ||
      typeof change.copper !== 'number'
    ) {
      return message.channel.send('❌ Purchase failed due to invalid coin breakdown.');
    }

    character.coins.gold = change.gold;
    character.coins.silver = change.silver;
    character.coins.copper = change.copper;

    for (let i = 0; i < quantity; i++) {
      character.inventory.push(item.name);
    }

    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Item Purchased!')
      .setDescription(`${character.name} purchased **${quantity} ${item.name}** for **${item.value * quantity} ${item.currency ?? 'copper'}**. View it in their inventory with \`.card\`.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};