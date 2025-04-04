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
  const gold = Math.floor(totalCopper / rates.gold);
  const remainingAfterGold = totalCopper % rates.gold;
  const silver = Math.floor(remainingAfterGold / rates.silver);
  const copper = remainingAfterGold % rates.silver;
  return { gold, silver, copper };
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

    const totalCostCopper = convertToCopper(item.value, item.currency) * quantity;
    const charTotalCopper = (character.coins.gold ?? 0) * rates.gold + (character.coins.silver ?? 0) * rates.silver + (character.coins.copper ?? 0);

    if (charTotalCopper < totalCostCopper) {
      return message.channel.send(`⚠️ ${character.name} doesn't have enough money to buy that.`);
    }

    const remainingCopper = charTotalCopper - totalCostCopper;
    const change = breakdownCopper(remainingCopper);

    // ✅ fallback to 0 if any are undefined
    character.coins.gold = change.gold ?? 0;
    character.coins.silver = change.silver ?? 0;
    character.coins.copper = change.copper ?? 0;

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