const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'useitem',
  description: 'Use an item from your character\'s inventory',
  async execute(message, args) {
    const [charName, itemName, quantityStr] = args;
    const quantity = parseInt(quantityStr);
    if (!charName || !itemName || isNaN(quantity) || quantity < 1) {
      return message.channel.send('⚠️ Usage: `.useitem <character> <item> <quantity>`');
    }

    const character = await Character.findOne({ name: { $regex: new RegExp(`^${charName}$`, 'i') } });
    if (!character) {
      return message.channel.send(`⚠️ Character **${charName}** not found.`);
    }

    const item = await MarketItem.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
    if (!item) {
      return message.channel.send(`⚠️ Item **${itemName}** not found in the market.`);
    }

    // Make sure the inventory is valid and contains this item
    const inventory = character.inventory || {};
    const ownedQty = inventory[item.name] || 0;

    if (ownedQty < quantity) {
      return message.channel.send(`⚠️ ${character.name} doesn't have that many **${item.name}**.`);
    }

    // Process healing if effect includes "+<HP>"
    let healing = 0;
    if (typeof item.effect === 'string' && item.effect.includes('+')) {
      const match = item.effect.match(/\+(\d+)\s*HP/i);
      if (match) {
        healing = parseInt(match[1]) * quantity;
      }
    }

    if (healing > 0) {
      if (!character.hp || typeof character.hp.current !== 'number' || typeof character.hp.max !== 'number') {
        return message.channel.send(`⚠️ ${character.name} doesn't have HP set. Use \`.sethp\` first.`);
      }

      character.hp.current = Math.min(character.hp.max, character.hp.current + healing);
    }

    // Subtract used quantity
    inventory[item.name] -= quantity;
    if (inventory[item.name] <= 0) {
      delete inventory[item.name];
    }

    character.inventory = inventory;
    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Item Used!')
      .setDescription(`${character.name} used ${quantity} ${item.name}${healing > 0 ? ` and restored **${healing}** HP!` : ' successfully.'}`)
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};