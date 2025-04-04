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

function formatCurrency(value, currency) {
  const mapping = {
    copper: {
      singular: 'copper star',
      plural: 'copper stars',
      emoji: '<:C_copperstar:1346130043415298118>'
    },
    silver: {
      singular: 'silver stag',
      plural: 'silver stags',
      emoji: '<:C_silverstag:1346130090378920066>'
    },
    gold: {
      singular: 'gold dragon',
      plural: 'gold dragons',
      emoji: '<:C_golddragon:1346130130564808795>'
    }
  };

  const unit = value === 1 ? mapping[currency].singular : mapping[currency].plural;
  const emoji = mapping[currency].emoji;
  return `${value} ${unit} ${emoji}`;
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

    // Deduct coins top-down
    let remaining = totalCostCopper;

    const goldToUse = Math.min(character.coins.gold * rates.gold, remaining);
    const goldCoinsToRemove = Math.floor(goldToUse / rates.gold);
    character.coins.gold -= goldCoinsToRemove;
    remaining -= goldCoinsToRemove * rates.gold;

    const silverToUse = Math.min(character.coins.silver * rates.silver, remaining);
    const silverCoinsToRemove = Math.floor(silverToUse / rates.silver);
    character.coins.silver -= silverCoinsToRemove;
    remaining -= silverCoinsToRemove * rates.silver;

    const copperToUse = Math.min(character.coins.copper, remaining);
    character.coins.copper -= copperToUse;
    remaining -= copperToUse;

    if (remaining > 0) {
      return message.channel.send(`❌ Unexpected error: could not deduct enough coins.`);
    }

    // Add to inventory
    for (let i = 0; i < quantity; i++) {
      character.inventory.push(item.name);
    }

    await character.save();

    const costText = formatCurrency(item.value * quantity, item.currency);

    const embed = new EmbedBuilder()
      .setTitle('― Item Purchased!')
      .setDescription(`${character.name} purchased **${quantity} ${item.name}** for **${costText}**. View it in their inventory with \`.card\`.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};