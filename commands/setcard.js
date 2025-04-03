const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'setcard',
  description: 'Set the card image for a character',

  async execute(message, args) {
    const name = args[0]?.trim();
    const imageUrl = args[1]?.trim();

    if (!name || !imageUrl || args.length !== 2) {
      return message.channel.send('Please provide the character name and image URL. Example: `.setcard Vaelarys https://imgur.com/example.png`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (!character) {
      return message.channel.send(`No character found with the name **${name}**.`);
    }

    character.image = imageUrl;
    await character.save();

    const embed = new EmbedBuilder()
      .setTitle('― Card Image Set!')
      .setDescription(`${character.name}'s card image was successfully set. Run \`.card\` to view their updated information.`)
      .setImage(imageUrl)
      .setColor('#23272A');

    await message.channel.send({ embeds: [embed] });
  }
};