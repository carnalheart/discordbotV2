module.exports = {
    name: 'turnkey',
    async execute(message) {
      const allowedChannel = '1343214370179776613';
      const roleToAdd = '1343869270660091978';
      const roleToRemove = '1343869375182012456';
  
      if (
        message.channel.id !== allowedChannel ||
        message.content !== 'turn key'
      ) return;
  
      try {
        await message.delete();
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
  
      const addRole = message.guild.roles.cache.get(roleToAdd);
      const removeRole = message.guild.roles.cache.get(roleToRemove);
  
      if (!message.member.roles.cache.has(roleToAdd) && addRole) {
        message.member.roles.add(roleToAdd).catch(console.error);
      }
  
      if (message.member.roles.cache.has(roleToRemove) && removeRole) {
        message.member.roles.remove(roleToRemove).catch(console.error);
      }
    }
  };  