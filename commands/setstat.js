const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'setstat',
  description: 'Set a specific stat for a character',

  async execute(message, args) {
    const [name, stat, valueRaw] = args;
    const value = Number(valueRaw);

    if (!name || !stat || isNaN(value)) {
      return message.channel.send('Usage: `.setstat <character> <stat> <value>`\nExample: `.setstat Meralith constitution 16`');
    }

    const validStats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

    const statName = stat.toLowerCase();

    if (!validStats.includes(statName)) {
      return message.channel.send(`Invalid stat. Choose one of: ${validStats.join(', ')}`);
    }

    if (value < 0 || value > 20) {
      return message.channel.send('Stat value must be between 0 and 20.');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!character) {
      return message.channel.send(`No character found with the name **${name}**.`);
    }

    character.stats[statName] = value;

    // 💡 auto-update HP if constitution is being set
    if (statName === 'constitution') {
      const hp = Math.ceil(value / 2);
      character.hp = hp;
    }

    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Stat Updated!')
      .setDescription(`${character.name}'s **${statName}** stat is now set to **${value}**.`)
      .setColor('#23272A');

    await message.channel.send({ embeds: [embed] });
  }
};