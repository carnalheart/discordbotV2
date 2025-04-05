module.exports = {
    name: 'purge',
    async execute(message, args) {
      const STAFF_ROLE = '1343868729997525033';
      if (!message.member.roles.cache.has(STAFF_ROLE)) return;
  
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 1 || amount > 100) return;
  
      await message.channel.bulkDelete(amount, true).catch(() => null);
  
      message.client.emit('modAction', {
        type: 'purge',
        target: null,
        author: message.author,
        reason: amount
      });
    }
  };  