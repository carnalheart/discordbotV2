const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const itemDB = require('../data/itemList'); // Ensure this is where your item list is stored

module.exports = {
  name: 'card',
  description: 'View a character\'s RPG card.',
  async execute(message, args) {
    const name = args[0];
    if (!name) return message.reply('Please provide a character name.');

    const character = await Character.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!character) return message.reply(`Character **${name}** not found.`);

    const {
      strength, dexterity, constitution,
      intelligence, wisdom, charisma
    } = character.stats;

    const { copper = 0, silver = 0, gold = 0 } = character.coins;
    const hpCurrent = character.hpCurrent ?? 0;
    const hpMax = character.hpMax ?? 0;

    // Inventory formatting
    const inventoryList = character.inventory.length
      ? character.inventory.map(itemObj => {
          const itemName = Object.keys(itemObj)[0];
          const quantity = itemObj[itemName];
          const dbItem = itemDB.find(i => i.name.toLowerCase() === itemName.toLowerCase());
          const displayName = itemName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          const emoji = dbItem?.emoji || '';
          return `➺ ${emoji} **${displayName}** ・ x${quantity}`;
        }).join('\n')
      : '*No items yet.*';

    const bio = character.bio || 'https://discord.com';
    const image = character.image || 'https://i.imgur.com/5c3aNMa.png?quality=lossless';

    const embed = new EmbedBuilder()
      .setTitle(`<:servericon:1343229799228899419> ― ${character.name}`)
      .setDescription(`[Character biography.](${bio})`)
      .addFields(
        {
          name: 'Statistics',
          value:
            `➺ **Strength** ・ ${strength}\n` +
            `➺ **Dexterity** ・ ${dexterity}\n` +
            `➺ **Constitution** ・ ${constitution}\n` +
            `➺ **Intelligence** ・ ${intelligence}\n` +
            `➺ **Wisdom** ・ ${wisdom}\n` +
            `➺ **Charisma** ・ ${charisma}\n` +
            `➺ **Health Points** ・ ${hpCurrent}/${hpMax}`
        },
        {
          name: 'Coin Pouch',
          value:
            `➺ **Copper Stars** ・ ${copper} <:C_copperstar:1346130043415298118>\n` +
            `➺ **Silver Stags** ・ ${silver} <:C_silverstag:1346130090378920066>\n` +
            `➺ **Gold Dragons** ・ ${gold} <:C_golddragon:1346130130564808795>`
        },
        {
          name: 'Inventory',
          value: inventoryList
        }
      )
      .setImage(image)
      .setFooter({ text: 'This is your character’s roleplay card. Run .help for a detailed list of RPG commands and how to use them.' })
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};