const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const Item = require('../models/marketitem');

module.exports = {
  name: 'sellitem',
  description: 'Sell an item from a character\'s inventory.',

  async execute(message, args) {
    const [charName, ...rest] = args;
    const quantity = parseInt(rest.pop(), 10);
    const itemName = rest.join(' ').trim();

    if (!charName || !itemName || isNaN(quantity) || quantity < 1) {
      return message.channel.send('Usage: `.sellitem <character> <item> <quantity>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${charName}$`, 'i') });
    if (!character) return message.channel.send(`⚠️ Character **${charName}** not found.`);

    const inventoryItem = character.inventory.find(i => Object.keys(i)[0].toLowerCase() === itemName.toLowerCase());
    if (!inventoryItem) return message.channel.send(`${character.name} does not have any **${itemName}**.`);

    const actualItemName = Object.keys(inventoryItem)[0];
    const currentQty = inventoryItem[actualItemName];

    if (currentQty < quantity) {
      return message.channel.send(`${character.name} does not have enough of that item.`);
    }

    const item = await Item.findOne({ name: new RegExp(`^${actualItemName}$`, 'i') });
    if (!item) return message.channel.send(`⚠️ Item **${actualItemName}** is not registered in the market.`);

    const totalCopper = item.price * quantity;

    // Remove quantity from inventory
    if (currentQty === quantity) {
      character.inventory = character.inventory.filter(i => Object.keys(i)[0] !== actualItemName);
    } else {
      inventoryItem[actualItemName] -= quantity;
    }

    // Convert copper to coins
    const gold = Math.floor(totalCopper / 10000);
    const silver = Math.floor((totalCopper % 10000) / 100);
    const copper = totalCopper % 100;

    character.coins.gold += gold;
    character.coins.silver += silver;
    character.coins.copper += copper;
    await character.save();

    // Construct payout string
    const payoutParts = [];
    if (gold > 0) payoutParts.push(`${gold} gold dragon${gold > 1 ? 's' : ''} <:C_golddragon:1346130130564808795>`);
    if (silver > 0) payoutParts.push(`${silver} silver stag${silver > 1 ? 's' : ''} <:C_silverstag:1346130090378920066>`);
    if (copper > 0 || payoutParts.length === 0) payoutParts.push(`${copper} copper star${copper > 1 ? 's' : ''} <:C_copperstar:1346130043415298118>`);

    const emoji = item.emoji || '';
    const pluralSuffix = quantity === 1 ? '' : 's';

    const embed = new EmbedBuilder()
      .setTitle('― Item Sold!')
      .setDescription(`**${character.name}** sold **${quantity} ${actualItemName}${pluralSuffix} ${emoji}** in exchange for **${payoutParts.join(', ')}**.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};