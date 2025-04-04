const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

const rates = {
  gold: { silver: 210, copper: 14700 },
  silver: { gold: 1 / 210, copper: 70 },
  copper: { gold: 1 / 14700, silver: 1 / 70 }
};

const normalize = (type) => {
  type = type.toLowerCase().replace(/s$/, ''); // handles plurals like "golds"
  if (!['gold', 'silver', 'copper'].includes(type)) return null;
  return type;
};

module.exports = {
  name: 'exchange',
  description: 'Exchange currency between types for a character',

  async execute(message, args) {
    const [charName, rawAmount, fromTypeRaw, , toTypeRaw] = args;
    const amount = parseInt(rawAmount);

    if (!charName || !rawAmount || !fromTypeRaw || !toTypeRaw || isNaN(amount)) {
      return message.channel.send('Usage: `.exchange <character> <amount> <fromCurrency> to <toCurrency>`');
    }

    const from = normalize(fromTypeRaw);
    const to = normalize(toTypeRaw);
    if (!from || !to || from === to) {
      return message.channel.send('Invalid currency types. Use copper, silver, or gold.');
    }

    const character = await Character.findOne({ name: new RegExp(`^${charName}$`, 'i') });
    if (!character) return message.channel.send(`Character **${charName}** not found.`);

    if ((character.coins?.[from] ?? 0) < amount) {
      return message.channel.send(`${character.name} doesn't have enough ${from} to exchange.`);
    }

    const result = Math.floor(amount * rates[from][to]);
    if (result < 1) {
      return message.channel.send('That exchange would result in less than 1 coin. Try a larger amount.');
    }

    // Perform exchange
    character.coins[from] -= amount;
    character.coins[to] = (character.coins[to] ?? 0) + result;
    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Currency Exchanged!')
      .setDescription(`${character.name} exchanged **${amount} ${from}** for **${result} ${to}**.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};