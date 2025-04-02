const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require('discord.js');
  
  const { panelChannelId } = require('../config.json');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('deployticket')
      .setDescription('Deploy the support ticket panel (admin only)')
      .setDefaultMemberPermissions(0),
  
    async execute(interaction) {
      console.log('📨 /deployticket triggered by', interaction.user.tag);
  
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
        console.log('📡 Fetching panel channel:', panelChannelId);
        const panelChannel = await interaction.client.channels.fetch(panelChannelId);
        console.log('✅ Channel found:', panelChannel.name);
  
        await panelChannel.send({ embeds: [embed], components: [button] });
  
        await interaction.reply({
          content: '✅ Ticket panel successfully sent.',
          ephemeral: true,
        });
  
        console.log('🎉 Ticket panel sent successfully.');
      } catch (err) {
        console.error('❌ Error in deployticket:', err);
  
        // Fallback interaction reply if something goes wrong
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ Failed to send the ticket panel. Check bot permissions and channel ID.',
            ephemeral: true,
          });
        }
      }
    },
  };  