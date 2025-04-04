const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const MarketItem = require('../models/MarketItem');

module.exports = {
  name: 'useitem',
  description: 'Use an item from your character’s inventory',

  async execute(message, args) {
    const [charName, ...rest] = args;
    const quantity = parseInt(rest.pop());
    const itemName = rest.join(' ');

    if (!charName || !itemName || isNaN(quantity) || quantity < 1) {
      return message.channel.send('❌ Usage: `.useitem <character> <item> <quantity>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${charName}$`, 'i') });
    if (!character) return message.channel.send(`⚠️ Character **${charName}** not found.`);

    const item = await MarketItem.findOne({ name: new RegExp(`^${itemName}$`, 'i') });
    if (!item) return message.channel.send(`⚠️ Item **${itemName}** not found.`);

    // 🛡️ fallback for missing coins (future-proof)
    if (!character.coins) {
      character.coins = { gold: 0, silver: 0, copper: 0 };
    } else {
      character.coins.gold = character.coins.gold ?? 0;
      character.coins.silver = character.coins.silver ?? 0;
      character.coins.copper = character.coins.copper ?? 0;
    }

    const inventory = character.inventory;
    const ownedQuantity = inventory.filter(i => i === item.name).length;

    if (ownedQuantity < quantity) {
      return message.channel.send(`⚠️ ${character.name} does not have enough of **${item.name}** to use.`);
    }

    // 🧪 parse known effects
    let hpRestored = 0;
    if (item.effect && item.effect.toLowerCase().includes('restores 5hp')) {
      hpRestored = 5 * quantity;
    }

    // 🩸 apply HP restore (if any)
    let resultText = '';
    if (hpRestored > 0 && character.hpMax) {
      const before = character.hpCurrent ?? 0;
      character.hpCurrent = Math.min(character.hpMax, before + hpRestored);
      resultText += `Restored **${character.hpCurrent - before} HP**. `;
    }

    // 🧹 remove used items
    let removed = 0;
    character.inventory = inventory.filter(i => {
      if (i === item.name && removed < quantity) {
        removed++;
        return false;
      }
      return true;
    });

    await character.save();

    const embed = new EmbedBuilder()
      .setTitle(`― ${item.name} Used!`)
      .setDescription(`${character.name} used **${quantity} ${item.name}**.${resultText ? `\n\n${resultText}` : ''}`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};