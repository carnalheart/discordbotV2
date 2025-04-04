const Character = require('../models/character');

module.exports = {
  name: 'resetcoins',
  description: 'Admin only: resets a character’s coin pouch',
  
  async execute(message, args) {
    const roleId = '1343868729997525033';
    if (!message.member.roles.cache.has(roleId)) {
      return message.channel.send('❌ You do not have permission to use this command.');
    }

    const charName = args.join(' ');
    if (!charName) return message.channel.send('❌ Usage: `.resetcoins <character>`');

    const character = await Character.findOne({ name: new RegExp(`^${charName}$`, 'i') });
    if (!character) return message.channel.send(`⚠️ Character **${charName}** not found.`);

    character.coins = { gold: 0, silver: 0, copper: 0 };
    await character.save();

    return message.channel.send(`Coin pouch reset for **${character.name}**.`);
  }
};
