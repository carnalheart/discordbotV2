const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  async execute(message, args) {
    const STAFF_ROLE = '1343868729997525033';
    if (!message.member.roles.cache.has(STAFF_ROLE)) return;

    const userId = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided.';

    if (!userId) return message.channel.send('Usage: `.ban <user> <reason>`');

    try {
      const user = await message.client.users.fetch(userId);
      await message.guild.members.ban(user.id, { reason });

      const embed = new EmbedBuilder()
        .setTitle('― Banned!')
        .setDescription(`**${user.tag} (${user.id})** was banned from the server by <@${message.author.id}>. Reason: **${reason}**.`)
        .setColor('#23272A');

      message.channel.send({ embeds: [embed] });

      message.client.emit('modAction', {
        type: 'ban',
        target: user,
        author: message.author,
        reason
      });

    } catch (err) {
      message.channel.send('Could not ban user.');
    }
  }
};