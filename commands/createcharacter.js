const { EmbedBuilder } = require('discord.js');
const path = require('path');

// ✅ debug: print the resolved path to character.js
console.log('🧭 Trying to load Character model from:', path.resolve(__dirname, '../models/character'));

const Character = require(path.resolve(__dirname, '../models/character'));

module.exports = {
  name: 'createcharacter',
  description: 'Create a new RPG character',

  async execute(message, args) {
    const name = args[0]?.trim();
    if (!name || args.length > 1) {
      return message.reply('❌ Please provide a **single-word** name. Example: `.createcharacter Vaelarys`');
    }

    // check case-insensitive duplicate
    const existing = await Character.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existing) {
      return message.reply('⚠️ A character with that name already exists (case-insensitive).');
    }

    const newChar = new Character({
      name,
      owner: message.author.id,
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

    message.reply(`✅ Character **${name}** has been created!`);
  }
};