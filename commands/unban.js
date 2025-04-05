const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Unban a user from the server',

  async execute(message, args) {
    const STAFF_ROLE = '1343868729997525033';
    if (!message.member.roles.cache.has(STAFF_ROLE)) return;

    const userId = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided.';
    if (!userId) return message.channel.send('Please specify a user ID to unban.');

    const bans = await message.guild.bans.fetch().catch(() => null);
    if (!bans?.has(userId)) return message.channel.send('This user is not currently banned.');

    const user = bans.get(userId).user;

    await message.guild.members.unban(userId, reason).catch(() => {
      return message.channel.send('Failed to unban the user.');
    });

    const embed = new EmbedBuilder()
      .setTitle('― Unbanned!')
      .setDescription(`**${user.tag} (${user.id})** was unbanned from the server by <@${message.author.id}>. Reason: **${reason}**.`)
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};