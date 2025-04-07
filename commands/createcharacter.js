const { EmbedBuilder } = require('discord.js');
const path = require('path');
const Character = require(path.resolve(__dirname, '../models/character'));

module.exports = {
  name: 'createcharacter',
  description: 'Create a new RPG character',

  async execute(message, args) {
    const name = args[0]?.trim();
    if (!name || args.length > 1) {
      return message.channel.send('Please provide a **single-word** name. Example: `.createcharacter Vaelarys`');
    }

    const existing = await Character.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existing) {
      return message.channel.send('A character with that name already exists (case-insensitive).');
    }

    const newChar = new Character({
      name,
      ownerId: message.author.id, // ✅ Fix: ensure required ownerId field is used
      bio: '',
      image: '',
      stats: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
      },
      coins: {
        copper: 0,
        silver: 0,
        gold: 0
      },
      inventory: []
    });

    await newChar.save();

    const embed = new EmbedBuilder()
      .setTitle('― Character Created!')
      .setDescription(`${name} has been successfully created. Run \`.card\` to view their information.`)
      .setColor('#23272A');

    await message.channel.send({ embeds: [embed] });
  }
};