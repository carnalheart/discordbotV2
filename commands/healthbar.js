const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'healthbar',
  description: 'Show a character’s current health bar',

  async execute(message, args) {
    const name = args[0]?.trim();
    if (!name || args.length > 1) {
      return message.channel.send('Usage: `.healthbar <character>`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (!character) {
      return message.channel.send(`No character found with the name **${name}**.`);
    }

    if (character.hpMax === null || character.hpCurrent === null) {
      return message.channel.send(`${character.name} doesn't have HP set yet. Run \`.sethp\` first.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`― ${character.name}'s Health Bar`)
      .setDescription(`**${character.hpCurrent}/${character.hpMax}**`)
      .setColor('#23272A');

    await message.channel.send({ embeds: [embed] });
  }
};