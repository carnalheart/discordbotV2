module.exports = {
    name: 'purge',
    description: 'Purge messages from a channel (staff only)',
  
    async execute(message, args) {
      const STAFF_ROLE = '1343868729997525033';
      if (!message.member.roles.cache.has(STAFF_ROLE)) return;
  
      const amount = parseInt(args[0], 10);
  
      if (isNaN(amount) || amount < 1 || amount > 100) {
        return;
      }
  
      await message.channel.bulkDelete(amount, true).catch(() => {});
    }
  };  