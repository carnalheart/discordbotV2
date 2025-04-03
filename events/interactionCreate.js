const {
    ChannelType,
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require('discord.js');
  
  const {
    ticketCategoryId,
    closedCategoryId,
    staffRoleId
  } = require('../config.json');
  
  module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
      if (!interaction.isButton()) return;
  
      const { guild, member, customId, client } = interaction;
  
      if (customId === 'open_ticket') {
        // check if they already have an open ticket
        const existing = guild.channels.cache.find(
          ch =>
            ch.parentId === ticketCategoryId &&
            ch.name === `ticket-${member.user.username.toLowerCase()}`
        );
  
        if (existing) {
          return interaction.reply({
            content: `You already have a ticket open: ${existing}`,
            ephemeral: true,
          });
        }
  
        const channel = await guild.channels.create({
          name: `ticket-${member.user.username}`,
          type: ChannelType.GuildText,
          parent: ticketCategoryId,
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: member.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
              ],
            },
            {
              id: staffRoleId,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
              ],
            },
          ],
        });
  
        const ticketEmbed = new EmbedBuilder()
          .setTitle('⚜️ ― 𝑺𝒆𝒓𝒗𝒆𝒓 𝑺𝒖𝒑𝒑𝒐𝒓𝒕')
          .setDescription(
            'Thank you for contacting support - we will attend to this ticket as soon as possible. Please explain your inquiry or report in as much detail as possible whilst you wait for assistance.'
          )
          .setFooter({
            text: 'Please ping an online staff member if you have not received a response in over 24 hours.',
          })
          .setColor('#23272A');
  
        const closeButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close The Ticket')
            .setStyle(ButtonStyle.Danger)
        );
  
        await channel.send({
          content: `<@${member.id}> <@&${staffRoleId}>`,
          embeds: [ticketEmbed],
          components: [closeButton],
        });
  
        await interaction.reply({
          content: `Ticket opened: ${channel}`,
          ephemeral: true,
        });
      }
  
      if (customId === 'close_ticket') {
        if (!member.roles.cache.has(staffRoleId)) {
          return interaction.reply({
            content: 'Only staff can close tickets.',
            ephemeral: true,
          });
        }
  
        await interaction.channel.setParent(closedCategoryId);
        await interaction.channel.lockPermissions();
  
        await interaction.reply({
          content: 'Your ticket was closed. If this was a mistake please take a screenshot and open a new ticket detailing your issue.',
          ephemeral: true,
        });
      }
    },
  };  