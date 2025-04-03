const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'sethp',
  description: 'Set a character’s maximum HP (only once)',

  async execute(message, args) {
    const name = args[0]?.trim();
    const hpValue = Number(args[1]);

    if (!name || ![5, 10, 15].includes(hpValue)) {
      return message.channel.send('Usage: `.sethp <character> <5 | 10 | 15>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (!character) {
      return message.channel.send(`No character found with the name **${name}**.`);
    }

    if (character.hpMax !== null) {
      return message.channel.send(`${character.name}'s HP has already been set and cannot be changed.`);
    }

    character.hpMax = hpValue;
    character.hpCurrent = hpValue;

    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Hit Points Set!')
      .setDescription(`${character.name} now has **${hpValue} HP**.`)
      .setColor('#23272A');

    await message.channel.send({ embeds: [embed] });
  }
};