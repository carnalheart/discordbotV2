const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  async execute(message, args) {
    const STAFF_ROLE = '1343868729997525033';
    if (!message.member.roles.cache.has(STAFF_ROLE)) return;

    const userArg = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided.';

    if (!userArg) return message.channel.send('Usage: `.kick <user> <reason>`');

    let user;
    try {
      user = await message.guild.members.fetch(userArg).catch(() => null);
    } catch {
      user = null;
    }

    if (!user) return message.channel.send('User not found.');

    await user.kick(reason);

    const embed = new EmbedBuilder()
      .setTitle('― Kicked!')
      .setDescription(`**${user.user.tag} (${user.id})** was kicked from the server by <@${message.author.id}>. Reason: **${reason}**.`)
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });

    message.client.emit('modAction', {
      type: 'kick',
      target: user.user,
      author: message.author,
      reason
    });
  }
};