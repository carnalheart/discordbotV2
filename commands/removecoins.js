const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'removecoins',
  description: 'Admin: remove currency from a character',

  async execute(message, args) {
    const ADMIN_ROLE = '1343868729997525033';
    if (!message.member.roles.cache.has(ADMIN_ROLE)) return;

    const [name, rawAmount, typeRaw] = args;
    const amount = parseInt(rawAmount);
    const type = typeRaw?.toLowerCase().replace(/s$/, '');

    if (!name || !amount || !['gold', 'silver', 'copper'].includes(type)) {
      return message.channel.send('Usage: `.removecoins <character> <amount> <type>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!character) return message.channel.send(`Character **${name}** not found.`);

    if ((character.coins?.[type] ?? 0) < amount) {
      return message.channel.send(`${character.name} doesn't have enough ${type} to remove.`);
    }

    character.coins[type] -= amount;
    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Coins Removed')
      .setDescription(`Took **${amount} ${type}** from ${character.name}.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};