const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const LOG_CHANNEL_ID = 'YOUR_LOG_CHANNEL_ID_HERE'; // Replace this with actual log channel ID

  const log = async (embed) => {
    try {
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      } else {
        console.warn('Logger: Failed to fetch log channel.');
      }
    } catch (err) {
      console.error('Logger error:', err);
    }
  };

  const sanitize = (content) =>
    content
      ?.replace(/<@!?(\d+)>/g, (_, id) => `@User(${id})`)
      .replace(/<@&(\d+)>/g, (_, id) => `@Role(${id})`)
      .replace(/<#(\d+)>/g, (_, id) => `#Channel(${id})`)
      .replace(/`/g, "'");

  // Message Delete
  client.on('messageDelete', async (message) => {
    try {
      if (message.partial) await message.fetch();
      if (message.author?.bot || !message.guild) return;

      const embed = new EmbedBuilder()
        .setTitle('Message Deleted')
        .setDescription(`**User:** ${message.author.tag} (${message.author.id})\n**Channel:** #${message.channel.name}`)
        .addFields({ name: 'Content', value: sanitize(message.content) || '*[no text]*' })
        .setColor('#23272A')
        .setTimestamp();

      log(embed);
    } catch (err) {
      console.error('Logger (messageDelete) error:', err);
    }
  });

  client.on('messageUpdate', async (oldMsg, newMsg) => {
    try {
      if (oldMsg.partial) await oldMsg.fetch();
      if (newMsg.partial) await newMsg.fetch();
      if (oldMsg.author?.bot || !oldMsg.guild || oldMsg.content === newMsg.content) return;

      const embed = new EmbedBuilder()
        .setTitle('Message Edited')
        .setDescription(`**User:** ${oldMsg.author.tag} (${oldMsg.author.id})\n**Channel:** #${oldMsg.channel.name}`)
        .addFields(
          { name: 'Before', value: sanitize(oldMsg.content) || '*[no text]*' },
          { name: 'After', value: sanitize(newMsg.content) || '*[no text]*' }
        )
        .setColor('#23272A')
        .setTimestamp();

      log(embed);
    } catch (err) {
      console.error('Logger (messageUpdate) error:', err);
    }
  });

};