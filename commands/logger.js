const logChannelId = '1356705653107851364';

function logEvent(content, guild) {
  const logChannel = guild.channels.cache.get(logChannelId);
  if (logChannel) logChannel.send({ content }).catch(console.error);
}

module.exports = (client) => {
  client.on('messageCreate', message => {
    if (message.author.bot) return;
    logEvent(`**Message sent** in <#${message.channel.id}> by ${message.author.tag}:\n${message.content}`, message.guild);
  });

  client.on('messageDelete', message => {
    if (!message.guild || message.author?.bot) return;
    logEvent(`**Message deleted** in <#${message.channel.id}> by ${message.author?.tag || 'Unknown'}:\n${message.content}`, message.guild);
  });

  client.on('messageUpdate', (oldMsg, newMsg) => {
    if (!newMsg.guild || oldMsg.content === newMsg.content) return;
    logEvent(`**Message edited** in <#${newMsg.channel.id}> by ${newMsg.author?.tag}:\n**Before:** ${oldMsg.content}\n**After:** ${newMsg.content}`, newMsg.guild);
  });

  client.on('guildMemberAdd', member => {
    logEvent(`**${member.user.tag}** joined the server.`, member.guild);
  });

  client.on('guildMemberRemove', member => {
    logEvent(`**${member.user.tag}** left or was removed from the server.`, member.guild);
  });

  client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.partial) {
      reaction.fetch()
        .then(full => logEvent(`**${user.tag}** added reaction ${full.emoji} in <#${full.message.channel.id}>`, full.message.guild))
        .catch(console.error);
    } else {
      logEvent(`**${user.tag}** added reaction ${reaction.emoji} in <#${reaction.message.channel.id}>`, reaction.message.guild);
    }
  });

  client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.partial) {
      reaction.fetch()
        .then(full => logEvent(`**${user.tag}** removed reaction ${full.emoji} in <#${full.message.channel.id}>`, full.message.guild))
        .catch(console.error);
    } else {
      logEvent(`**${user.tag}** removed reaction ${reaction.emoji} in <#${reaction.message.channel.id}>`, reaction.message.guild);
    }
  });

  client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
      logEvent(`**${newMember.user.tag}** changed nickname:\n**Before:** ${oldMember.nickname || 'none'}\n**After:** ${newMember.nickname || 'none'}`, newMember.guild);
    }

    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    addedRoles.forEach(role => {
      logEvent(`**${newMember.user.tag}** was given role <@&${role.id}>`, newMember.guild);
    });

    removedRoles.forEach(role => {
      logEvent(`**${newMember.user.tag}** had role <@&${role.id}> removed`, newMember.guild);
    });
  });

  client.on('voiceStateUpdate', (oldState, newState) => {
    const member = newState.member;

    if (!oldState.channel && newState.channel) {
      logEvent(`**${member.user.tag}** joined voice channel **${newState.channel.name}**`, member.guild);
    } else if (oldState.channel && !newState.channel) {
      logEvent(`**${member.user.tag}** left voice channel **${oldState.channel.name}**`, member.guild);
    } else if (oldState.channel?.id !== newState.channel?.id) {
      logEvent(`**${member.user.tag}** switched from **${oldState.channel.name}** to **${newState.channel.name}**`, member.guild);
    }
  });
};