const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require('discord.js');
  
  const { panelChannelId } = require('../config.json');
  
  module.exports = {
    name: 'deployticket',
    description: 'Post the support ticket panel (admin only)',
  
    async execute(message) {
      // Only allow admins to run this
      if (!message.member.permissions.has('Administrator')) {
        return message.reply({
          content: '❌ You do not have permission to use this command.',
          ephemeral: true,
        });
      }
  
      const embed = new EmbedBuilder()
        .setTitle('⚜️ ― 𝑺𝒆𝒓𝒗𝒆𝒓 𝑺𝒖𝒑𝒑𝒐𝒓𝒕')
        .setDescription(
          'Click the red button below to open a private ticket with the staff team. Please utilise tickets instead of DMing staff members.'
        )
        .setColor('#23272A')
        .setImage(
          'https://media.discordapp.net/attachments/1340296826653249616/1344593781546025031/Open-A-Ticket-27-02-2025.png?ex=67ee4d0a&is=67ecfb8a&hm=da766e1e114be66df03ca5d82f759664d01e3170f600f28a6e5ab8e855a460d5&=&format=webp&quality=lossless&width=1279&height=266'
        );
  
      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open_ticket')
          .setLabel('🎟️')
          .setStyle(ButtonStyle.Danger)
      );
  
      try {
        const panelChannel = await message.client.channels.fetch(panelChannelId);
        await panelChannel.send({ embeds: [embed], components: [button] });
  
        await message.reply({
          content: '✅ Ticket panel sent!',
          ephemeral: true,
        });
  
        // Optionally delete the message that triggered it
        if (message.channel.id !== panelChannelId) {
          message.delete().catch(() => {});
        }
  
      } catch (err) {
        console.error('❌ Failed to send panel:', err);
        await message.reply({
          content: '❌ Could not send the panel. Check bot permissions and channel ID.',
        });
      }
    },
  };  