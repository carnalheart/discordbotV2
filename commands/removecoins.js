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

    const emojiMap = {
      copper: '<:C_copperstar:1346130043415298118>',
      silver: '<:C_silverstag:1346130090378920066>',
      gold: '<:C_golddragon:1346130130564808795>'
    };

    if (!name || !amount || !['gold', 'silver', 'copper'].includes(type)) {
      return message.channel.send('Usage: `.removecoins <character> <amount> <type>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!character) return message.channel.send(`Character **${name}** not found.`);

    character.coins[type] = Math.max((character.coins[type] ?? 0) - amount, 0);
    await character.save();

    const coinText = `${type} ${emojiMap[type]}`;

    const embed = new EmbedBuilder()
      .setTitle('― Coins Removed')
      .setDescription(`Removed **${amount} ${coinText}** from ${character.name}.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};