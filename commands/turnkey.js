module.exports = {
    name: 'turnkey',
    async execute(message) {
      const allowedChannel = '1343214370179776613';
      const roleId = '1343869270660091978';
  
      // Only allow in specific channel and exact phrase
      if (
        message.channel.id !== allowedChannel ||
        message.content !== 'turn key'
      ) return;
  
      // Delete the user's message (password)
      try {
        await message.delete();
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
  
      // Give role if they don't already have it
      const role = message.guild.roles.cache.get(roleId);
      if (!role) return;
  
      if (!message.member.roles.cache.has(roleId)) {
        message.member.roles.add(roleId).catch(console.error);
      }
    }
  };
  