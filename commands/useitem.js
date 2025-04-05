const Character = require('../models/character');
const MarketItem = require('../models/marketitem');

function toTitleCase(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  name: 'useitem',
  description: 'Use a consumable item.',
  async execute(message, args) {
    const [charName, itemName, qtyStr] = args;
    const quantity = parseInt(qtyStr);
    if (!charName || !itemName || isNaN(quantity)) {
      return message.reply('Usage: `.useitem <character> <item> <quantity>`');
    }

    const character = await Character.findOne({ name: { $regex: `^${charName}$`, $options: 'i' } });
    const item = await MarketItem.findOne({ name: { $regex: `^${itemName}$`, $options: 'i' } });

    if (!character || !item) return message.reply('⚠️ Character or item not found.');

    const invEntry = character.inventory.find(i => Object.keys(i)[0].toLowerCase() === item.name.toLowerCase());
    if (!invEntry || invEntry[item.name] < quantity) {
      return message.reply(`⚠️ ${character.name} does not have enough of that item.`);
    }

    if (item.effect?.includes('HP')) {
      const heal = parseInt(item.effect.match(/\+(\d+)/)?.[1]);
      character.hpCurrent = Math.min(character.hpMax, character.hpCurrent + heal * quantity);
    }

    invEntry[item.name] -= quantity;
    if (invEntry[item.name] <= 0) {
      character.inventory = character.inventory.filter(i => Object.keys(i)[0] !== item.name);
    }

    await character.save();

    const embed = {
      title: '― Item Used!',
      description: `${character.name} used **${quantity} ${toTitleCase(item.name)}${quantity > 1 ? 's' : ''}**.`,
      color: 0x23272A,
    };

    message.channel.send({ embeds: [embed] });
  }
};