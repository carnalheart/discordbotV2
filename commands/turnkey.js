module.exports = {
    name: 'turnkey',
    execute(message) {
      const allowedChannel = '1343214370179776613';
      const roleId = '1343869270660091978';
  
      if (
        message.channel.id !== allowedChannel ||
        message.content !== 'turn key'
      ) return;
  
      const role = message.guild.roles.cache.get(roleId);
      if (!role) return;
  
      if (!message.member.roles.cache.has(roleId)) {
        message.member.roles.add(roleId).catch(console.error);
      }
    }
  };