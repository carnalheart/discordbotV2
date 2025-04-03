const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

module.exports = {
  name: 'card',
  description: 'View a character card',

  async execute(message, args) {
    const name = args[0]?.trim();
    if (!name || args.length > 1) {
      return message.channel.send('❌ Please provide a character name. Example: `.card Vaelarys`');
    }

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!character) {
      return message.channel.send(`⚠️ No character found with the name **${name}**.`);
    }

    const {
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma
    } = character.stats;

    const hpCurrent = character.hpCurrent ?? 0;
    const hpMax = character.hpMax ?? 0;

    const inventoryItems = {};
    for (const item of character.inventory) {
      inventoryItems[item] = (inventoryItems[item] || 0) + 1;
    }

    const inventory = Object.entries(inventoryItems).map(
      ([item, count]) => `➺ **${item}** ・x${count}`
    ).join('\n') || '*No items yet.*';

    const embed = new EmbedBuilder()
      .setTitle(`<:servericon:1343229799228899419> ― ${character.name}`)
      .setDescription(
        character.bio
          ? `[Character biography.](${character.bio})`
          : '_No bio link set._'
      )
      .setColor('#23272A')
      .addFields(
        {
          name: '__Statistics__',
          value: [
            `➺ **Strength** ・ ${strength}`,
            `➺ **Dexterity** ・ ${dexterity}`,
            `➺ **Constitution** ・ ${constitution}`,
            `➺ **Intelligence** ・ ${intelligence}`,
            `➺ **Wisdom** ・ ${wisdom}`,
            `➺ **Charisma** ・ ${charisma}`,
            `➺ **Health Points** ・ ${hpCurrent}/${hpMax}`
          ].join('\n')
        },
        {
          name: '__Coin Pouch__',
          value: [
            `➺ **Copper Stars** ・ ${character.coins?.copper || 0} <:copperstar:1346130043415298118>`,
            `➺ **Silver Stags** ・ ${character.coins?.silver || 0} <:silverstag:1346130090378920066>`,
            `➺ **Gold Dragons** ・ ${character.coins?.gold || 0} <:golddragon:1346130130564808795>`
          ].join('\n')
        },
        {
          name: '__Inventory__',
          value: inventory
        }
      )
      .setImage(character.image || 'https://i.imgur.com/5c3aNMa.png?quality=lossless')
      .setFooter({
        text: 'This is your character’s roleplay card. Run .help for a detailed list of RPG commands and how to use them.'
      });

    await message.channel.send({ embeds: [embed] });
  }
};