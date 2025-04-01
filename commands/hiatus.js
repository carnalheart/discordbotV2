const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'hiatus',
  execute(message) {
    const allowedChannel = '1344043468582031401';
    const roleId = '1354501284253798522';

    if (message.channel.id !== allowedChannel) return;

    const content = message.content.trim();

    if (content === '+hiatus') {
      if (!message.member.roles.cache.has(roleId)) {
        message.member.roles.add(roleId).catch(console.error);

        const embed = new EmbedBuilder()
          .setTitle('+ 𝑯𝒊𝒂𝒕𝒖𝒔')
          .setDescription(`You have been given the <@&${roleId}> role. Please run \`-hiatus\` to remove it.`)
          .setColor(0x23272A);

        message.reply({ embeds: [embed] });
      }
    }

    if (content === '-hiatus') {
      if (message.member.roles.cache.has(roleId)) {
        message.member.roles.remove(roleId).catch(console.error);

        const embed = new EmbedBuilder()
          .setTitle('- 𝑯𝒊𝒂𝒕𝒖𝒔')
          .setDescription(`The <@&${roleId}> role has been removed. Welcome back!`)
          .setColor(0x23272A);

        message.reply({ embeds: [embed] });
      }
    }
  }
};