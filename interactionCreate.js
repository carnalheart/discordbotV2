module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
      if (!interaction.isButton()) return;
  
      const { client, guild, member, customId } = interaction;
  
      if (customId === 'open_ticket') {
        const ticketChannel = await guild.channels.create({
          name: `ticket-${member.user.username}`,
          type: 0, // GUILD_TEXT
          parent: '1344590234419204136',
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              deny: ['ViewChannel'],
            },
            {
              id: member.id,
              allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
            },
            {
              id: '1343868729997525033', // staff role
              allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
            },
          ],
        });
  
        const ticketEmbed = {
          title: '⚜️ ― 𝑺𝒆𝒓𝒗𝒆𝒓 𝑺𝒖𝒑𝒑𝒐𝒓𝒕',
          description: 'Thank you for contacting support - we will attend to this ticket as soon as possible. Please explain your inquiry or report in as much detail as possible whilst you wait for assistance.',
          color: 0x23272A,
          footer: {
            text: 'Please ping an online staff member if you have not received a response in over 24 hours.',
          },
        };
  
        const closeButton = {
          type: 1,
          components: [
            {
              type: 2,
              style: 4, // red
              label: 'Close The Ticket',
              custom_id: 'close_ticket',
            },
          ],
        };
  
        await ticketChannel.send({
          content: `<@${member.id}> <@&1343868729997525033>`,
          embeds: [ticketEmbed],
          components: [closeButton],
        });
  
        await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });
      }
  
      if (customId === 'close_ticket') {
        if (!member.roles.cache.has('1343868729997525033')) {
          return interaction.reply({ content: 'Only staff can close tickets.', ephemeral: true });
        }
  
        await interaction.channel.setParent('1357001622437232740');
        await interaction.channel.lockPermissions(); // sync with closed category
        await interaction.reply({ content: 'Ticket closed and moved.', ephemeral: true });
      }
    },
  };  