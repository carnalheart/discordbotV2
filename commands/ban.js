const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a member from the server',

  async execute(message, args) {
    const STAFF_ROLE = '1343868729997525033';
    if (!message.member.roles.cache.has(STAFF_ROLE)) return;

    const userId = args[0]?.replace(/[<@!>]/g, '');
    const reason = args.slice(1).join(' ') || 'No reason provided.';
    if (!userId) return message.channel.send('Please specify a user ID or mention.');

    const user = await message.client.users.fetch(userId).catch(() => null);
    if (!user) return message.channel.send('Could not find that user.');

    await message.guild.members.ban(user.id, { reason }).catch(() => {
      return message.channel.send('Failed to ban the user.');
    });

    const embed = new EmbedBuilder()
      .setTitle('― Banned!')
      .setDescription(`**${user.tag} (${user.id})** was banned from the server by <@${message.author.id}>. Reason: **${reason}**.`)
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};