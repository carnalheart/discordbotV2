const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MarketItem = require('../models/marketitem');

function formatCurrency(value, currency) {
  const mapping = {
    copper: {
      singular: 'copper star',
      plural: 'copper stars',
      emoji: '<:C_copperstar:1346130043415298118>'
    },
    silver: {
      singular: 'silver stag',
      plural: 'silver stags',
      emoji: '<:C_silverstag:1346130090378920066>'
    },
    gold: {
      singular: 'gold dragon',
      plural: 'gold dragons',
      emoji: '<:C_golddragon:1346130130564808795>'
    }
  };

  const unit = value === 1 ? mapping[currency].singular : mapping[currency].plural;
  const emoji = mapping[currency].emoji;
  return `${value} ${unit} ${emoji}`;
}

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
      const cost = formatCurrency(item.value, item.currency);
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
        const cost = formatCurrency(item.value, item.currency);
        const effect = item.effect ? `— ${item.effect}` : '';
        return `➺ ${item.emoji} **${item.name}** ・ ${item.rarity} ${item.type} ・ **${cost}** ${effect}`;
      }).join('\n');

      const updatedEmbed = EmbedBuilder.from(embed).setDescription(itemList);
      await i.update({ embeds: [updatedEmbed], components: [row] });
    });
  }
};