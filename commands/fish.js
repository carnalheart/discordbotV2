const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');
const items = require('../data/itemEffects'); // Optional: centralize fish data here

module.exports = {
  name: 'fish',
  description: 'Go fishing using your character\'s wisdom and dexterity!',
  
  async execute(message, args) {
    const [charName] = args;
    if (!charName) return message.channel.send('Usage: `.fish <character>`');

    const character = await Character.findOne({ name: new RegExp(`^${charName}$`, 'i') });
    if (!character) return message.channel.send(`Character **${charName}** not found.`);

    const wisdom = parseInt(character.stats?.wisdom || 0);
    const dexterity = parseInt(character.stats?.dexterity || 0);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + wisdom + dexterity;

    let reward = null;

    if (total >= 22) reward = 'Lionfish';
    else if (total >= 18) reward = 'Red Mullet';
    else if (total >= 15) reward = 'Trout';
    else if (total >= 9) reward = 'Salmon';
    else if (total >= 4) reward = 'Anchovy';

    if (reward) {
      character.inventory.push(reward);
      await character.save();

      const itemData = require('../models/marketitem'); // use MarketItem DB for emoji & rarity
      const item = await itemData.findOne({ name: new RegExp(`^${reward}$`, 'i') });

      const embed = new EmbedBuilder()
        .setTitle('― Fishing Game')
        .setDescription(
          `A stir in the water catches **${character.name}**'s attention. As the end of their fishing line begins to tug, they respond with a yank, pulling a flip-flopping fish from the water.\n\n` +
          `**${character.name} caught a ${item?.rarity || 'unknown'} ${reward} ${item?.emoji || ''}!**`
        )
        .setColor('#23272A');

      return message.channel.send({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('― Fishing Game')
        .setDescription(
          `A stir in the water catches **${character.name}**'s attention. As the end of their fishing line begins to tug, they respond with a half-hearted yank. The fish on the end of their line frees itself and quickly swims away.\n\n` +
          `**${character.name} did not catch anything.**`
        )
        .setColor('#23272A');

      return message.channel.send({ embeds: [embed] });
    }
  }
};