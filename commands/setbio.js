const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'setbio',
  description: 'Set the biography link for a character',

  async execute(message, args) {
    const name = args[0]?.trim();
    const link = args[1]?.trim();

    if (!name || !link || args.length !== 2) {
      return message.channel.send('Please provide the character name and a valid bio link. Example: `.setbio Meralith https://yourlink.com`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!character) {
      return message.channel.send(`No character found with the name **${name}**.`);
    }

    character.bio = link;
    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Bio Link Set!')
      .setDescription(`${character.name}'s biography link was successfully set. Run \`.card\` to view their updated information.`)
      .setColor('#23272A');

    await message.channel.send({ embeds: [embed] });
  }
};