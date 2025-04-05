const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const LOG_CHANNEL_ID = '1356705653107851364';

  const log = async (embed) => {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (logChannel) logChannel.send({ embeds: [embed] });
  };

  const sanitize = (content) =>
    content
      ?.replace(/<@!?(\d+)>/g, (_, id) => `@User(${id})`)
      .replace(/<@&(\d+)>/g, (_, id) => `@Role(${id})`)
      .replace(/<#(\d+)>/g, (_, id) => `#Channel(${id})`)
      .replace(/`/g, "'");

  // Message Deleted
  client.on('messageDelete', async (message) => {
    if (message.partial) {
      try {
        message = await message.fetch();
      } catch (err) {
        console.error(`Logger (messageDelete) error:`, err);
        return;
      }
    }

    if (message.author?.bot || !message.guild) return;

    const embed = new EmbedBuilder()
      .setTitle('Message Deleted')
      .setDescription(`**User:** ${message.author.tag} (${message.author.id})\n**Channel:** #${message.channel.name}`)
      .addFields({ name: 'Content', value: sanitize(message.content) || '*[no text]*' })
      .setColor('#23272A')
      .setTimestamp();

    log(embed);
  });

  // Message Edited
  client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (oldMsg.partial || newMsg.partial) return;
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
  });

  // Member Join/Leave
  client.on('guildMemberAdd', (member) => {
    const embed = new EmbedBuilder()
      .setTitle('Member Joined')
      .setDescription(`${member.user.tag} (${member.id}) joined the server.`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  client.on('guildMemberRemove', (member) => {
    const embed = new EmbedBuilder()
      .setTitle('Member Left')
      .setDescription(`${member.user.tag} (${member.id}) left or was removed.`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  // Bans
  client.on('guildBanAdd', (ban) => {
    const embed = new EmbedBuilder()
      .setTitle('Member Banned')
      .setDescription(`${ban.user.tag} (${ban.user.id}) was banned.`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  client.on('guildBanRemove', (ban) => {
    const embed = new EmbedBuilder()
      .setTitle('Member Unbanned')
      .setDescription(`${ban.user.tag} (${ban.user.id}) was unbanned.`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  // Nickname Change
  client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
      const embed = new EmbedBuilder()
        .setTitle('Nickname Changed')
        .setDescription(`${newMember.user.tag} (${newMember.id}) changed their nickname.`)
        .addFields(
          { name: 'Old', value: oldMember.nickname || '*None*', inline: true },
          { name: 'New', value: newMember.nickname || '*None*', inline: true }
        )
        .setColor('#23272A')
        .setTimestamp();
      log(embed);
    }
  });

  // Channel Create/Delete/Update
  client.on('channelCreate', (channel) => {
    const embed = new EmbedBuilder()
      .setTitle('Channel Created')
      .setDescription(`#${channel.name} (${channel.id}) was created.`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  client.on('channelDelete', (channel) => {
    const embed = new EmbedBuilder()
      .setTitle('Channel Deleted')
      .setDescription(`#${channel.name} (${channel.id}) was deleted.`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  client.on('channelUpdate', (oldChannel, newChannel) => {
    if (oldChannel.name !== newChannel.name) {
      const embed = new EmbedBuilder()
        .setTitle('Channel Renamed')
        .setDescription(`Channel ID: ${newChannel.id}`)
        .addFields(
          { name: 'Old Name', value: oldChannel.name, inline: true },
          { name: 'New Name', value: newChannel.name, inline: true }
        )
        .setColor('#23272A')
        .setTimestamp();
      log(embed);
    }
  });

  // Role Create/Delete/Update
  client.on('roleCreate', (role) => {
    const embed = new EmbedBuilder()
      .setTitle('Role Created')
      .setDescription(`Role: ${role.name} (${role.id})`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  client.on('roleDelete', (role) => {
    const embed = new EmbedBuilder()
      .setTitle('Role Deleted')
      .setDescription(`Role: ${role.name} (${role.id})`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  client.on('roleUpdate', (oldRole, newRole) => {
    if (oldRole.name !== newRole.name) {
      const embed = new EmbedBuilder()
        .setTitle('Role Renamed')
        .addFields(
          { name: 'Old Name', value: oldRole.name, inline: true },
          { name: 'New Name', value: newRole.name, inline: true }
        )
        .setColor('#23272A')
        .setTimestamp();
      log(embed);
    }
  });

  // Guild/Server Updates
  client.on('guildUpdate', (oldGuild, newGuild) => {
    const embed = new EmbedBuilder()
      .setTitle('Server Updated')
      .setColor('#23272A')
      .setTimestamp();

    if (oldGuild.name !== newGuild.name) {
      embed.setDescription(`**Name changed:**\n${oldGuild.name} → ${newGuild.name}`);
    } else if (oldGuild.icon !== newGuild.icon) {
      embed.setDescription(`**Server icon was updated.**`);
      if (newGuild.iconURL()) embed.setThumbnail(newGuild.iconURL());
    } else {
      return;
    }

    log(embed);
  });

  // Emoji Events
  client.on('emojiCreate', (emoji) => {
    const embed = new EmbedBuilder()
      .setTitle('Emoji Created')
      .setDescription(`New emoji: \`${emoji.name}\` (${emoji.id})`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  client.on('emojiDelete', (emoji) => {
    const embed = new EmbedBuilder()
      .setTitle('Emoji Deleted')
      .setDescription(`Deleted emoji: \`${emoji.name}\` (${emoji.id})`)
      .setColor('#23272A')
      .setTimestamp();
    log(embed);
  });

  client.on('emojiUpdate', (oldEmoji, newEmoji) => {
    if (oldEmoji.name !== newEmoji.name) {
      const embed = new EmbedBuilder()
        .setTitle('Emoji Renamed')
        .addFields(
          { name: 'Old Name', value: oldEmoji.name, inline: true },
          { name: 'New Name', value: newEmoji.name, inline: true }
        )
        .setColor('#23272A')
        .setTimestamp();
      log(embed);
    }
  });
};