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

    const totalCostInCopper = convertToCopper(item.value, item.currency) * quantity;

    const charGold = character.coins.gold ?? 0;
    const charSilver = character.coins.silver ?? 0;
    const charCopper = character.coins.copper ?? 0;

    const charTotalCopper =
      (charGold * rates.gold) + (charSilver * rates.silver) + charCopper;

    if (charTotalCopper < totalCostInCopper) {
      return message.channel.send(`⚠️ ${character.name} doesn't have enough money to buy that.`);
    }

    const remainingCopper = charTotalCopper - totalCostInCopper;
    const change = breakdownCopper(remainingCopper);

    // Update character coins
    character.coins.gold = change.gold;
    character.coins.silver = change.silver;
    character.coins.copper = change.copper;

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