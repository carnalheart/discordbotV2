const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'deletecharacter',
  description: 'Permanently delete a character',

  async execute(message, args) {
    const name = args[0]?.trim();
    if (!name || args.length > 1) {
      return message.channel.send('Please provide the character name. Example: `.deletecharacter Vaelarys`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (!character) {
      return message.channel.send(`No character found with the name **${name}**.`);
    }

    await Character.deleteOne({ _id: character._id });

    const embed = new EmbedBuilder()
      .setTitle('― Character Deleted!')
      .setDescription('This is irreversible. If you wish to recreate this character in the future, you will have to start from scratch.')
      .setColor('#23272A');

    await message.channel.send({ embeds: [embed] });
  }
};