const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'marketview',
  description: 'View the in-character RPG market',

  async execute(message) {
    const items = await MarketItem.find().sort({ name: 1 });
    const itemsPerPage = 10;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    let page = 1;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);

    const itemList = pageItems.map(item => {
      const cost = `${item.value} ${item.currency}`;
      const effect = item.effect ? `— ${item.effect}` : '';
      return `➺ ${item.emoji} **${item.name}** ・ ${item.rarity} ${item.type} ・ **${cost}** ${effect}`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('<:servericon:1343229799228899419> ― RPG Market')
      .setDescription(itemList)
      .setFooter({ text: 'Have your character purchase an item with .marketbuy <character> <item> <quantity>' })
      .setColor('#23272A');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('market_left')
        .setEmoji('<:left:1357664737214857236>')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('market_right')
        .setEmoji('<:right:1357664782827917443>')
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'market_left' && page > 1) page--;
      else if (i.customId === 'market_right' && page < totalPages) page++;

      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = items.slice(start, end);

      const itemList = pageItems.map(item => {
        const cost = `${item.value} ${item.currency}`;
        const effect = item.effect ? `— ${item.effect}` : '';
        return `➺ ${item.emoji} **${item.name}** ・ ${item.rarity} ${item.type} ・ **${cost}** ${effect}`;
      }).join('\n');

      const updatedEmbed = EmbedBuilder.from(embed).setDescription(itemList);
      await i.update({ embeds: [updatedEmbed], components: [row] });
    });
  }
};