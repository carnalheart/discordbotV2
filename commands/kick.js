const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick a member from the server',

  async execute(message, args) {
    const STAFF_ROLE = '1343868729997525033';
    if (!message.member.roles.cache.has(STAFF_ROLE)) return;

    const user = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided.';

    if (!user) return message.channel.send('Please mention a valid user to kick.');

    await user.kick(reason).catch(() => {
      return message.channel.send('Failed to kick the user.');
    });

    const embed = new EmbedBuilder()
      .setTitle('― Kicked!')
      .setDescription(`**${user.user.tag} (${user.id})** was kicked from the server by <@${message.author.id}>. Reason: **${reason}**.`)
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};