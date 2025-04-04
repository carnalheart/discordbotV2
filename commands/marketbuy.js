const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/MarketItem');

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

    const totalCost = item.value * quantity;
    const currentCopper = character.coins?.copper || 0;

    if (currentCopper < totalCost) {
      return message.channel.send(`⚠️ ${character.name} doesn't have enough copper stars to buy that.`);
    }

    // Deduct copper + add item
    character.coins.copper -= totalCost;
    for (let i = 0; i < quantity; i++) {
      character.inventory.push(item.name);
    }

    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Item Purchased!')
      .setDescription(`${character.name} purchased **${quantity} ${item.name}** for **${totalCost}**. View it in their inventory with \`.card\`.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};