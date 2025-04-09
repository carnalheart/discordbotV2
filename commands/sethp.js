const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'sethp',
  description: 'Set a character’s maximum HP.',

  async execute(message, args) {
    const name = args[0]?.trim();
    const hpValue = Number(args[1]);

    if (!name || ![5, 10, 15].includes(hpValue)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('― Invalid Usage')
        .setDescription('Usage: `.sethp <character> <5 | 10 | 15>`')
        .setColor('#23272A');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (!character) {
      const notFoundEmbed = new EmbedBuilder()
        .setTitle('― Character Not Found')
        .setDescription(`No character found with the name **${name}**.`)
        .setColor('#23272A');
      return message.channel.send({ embeds: [notFoundEmbed] });
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