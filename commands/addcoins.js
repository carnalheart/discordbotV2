const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'addcoins',
  description: 'Admin: add currency to a character',

  async execute(message, args) {
    const ADMIN_ROLE = '1343868729997525033';
    if (!message.member.roles.cache.has(ADMIN_ROLE)) return;

    const [name, rawAmount, typeRaw] = args;
    const amount = parseInt(rawAmount);
    const type = typeRaw?.toLowerCase().replace(/s$/, '');

    if (!name || !amount || !['gold', 'silver', 'copper'].includes(type)) {
      return message.channel.send('Usage: `.addcoins <character> <amount> <type>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!character) return message.channel.send(`Character **${name}** not found.`);

    character.coins[type] = (character.coins[type] ?? 0) + amount;
    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Coins Added')
      .setDescription(`Gave **${amount} ${type}** to ${character.name}.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};