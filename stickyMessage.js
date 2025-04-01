const { EmbedBuilder } = require('discord.js');

// Store last sent sticky message IDs per channel
const lastStickyMessageIds = {};

// Define all your sticky configs here:
const stickyConfigs = {
  '1343603501904826469': new EmbedBuilder()
    .setTitle('<:pushpin:1354406924891979806> ― 𝑷𝒊𝒏𝒏𝒆𝒅 𝑹𝒆𝒎𝒊𝒏𝒅𝒆𝒓')
    .setDescription(
      `➺ *Compliment the artwork posted before you*.\n` +
      `➺ *Only post artwork you created*.\n` +
      `➺ *Remember to always give credit to any additional collaborators*.\n` +
      `➺ *Advertisements go in <#1343603603700584591>*.`
    )
    .setColor(0x23272A),

  // Example for future stickies:
  // 'anotherChannelId': new EmbedBuilder()
  //   .setTitle('Another Sticky')
  //   .setDescription('Rules or info here...')
  //   .setColor(0x23272A),
};

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    const { channel, author } = message;

    // Ignore bots and irrelevant channels
    if (author.bot || !stickyConfigs[channel.id]) return;

    try {
      // Delete previous sticky if it exists
      const prevId = lastStickyMessageIds[channel.id];
      if (prevId) {
        try {
          const previous = await channel.messages.fetch(prevId);
          if (previous) await previous.delete().catch(() => {});
        } catch {
          // Message may no longer exist — that's fine
        }
      }

      // Send new sticky
      const embed = stickyConfigs[channel.id];
      const sent = await channel.send({ embeds: [embed] });

      // Save new sticky ID
      lastStickyMessageIds[channel.id] = sent.id;

    } catch (err) {
      console.error(`Sticky message error in ${channel.id}:`, err);
    }
  });
};