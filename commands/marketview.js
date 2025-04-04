const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'marketview',
  description: 'View items in the RPG market',

  async execute(message) {
    const items = await MarketItem.find().sort({ name: 1 });
    const itemsPerPage = 10;
    let currentPage = 0;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const buildEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = items.slice(start, end);

      const display = pageItems.map(item => {
        const priceValue = item.value;
        const currency = item.currency?.toLowerCase();
        let currencyString = '';

        if (currency === 'copper') {
          currencyString = `${priceValue} copper star${priceValue === 1 ? '' : 's'} <:C_copperstar:1346130043415298118>`;
        } else if (currency === 'silver') {
          currencyString = `${priceValue} silver stag${priceValue === 1 ? '' : 's'} <:C_silverstag:1346130090378920066>`;
        } else if (currency === 'gold') {
          currencyString = `${priceValue} gold dragon${priceValue === 1 ? '' : 's'} <:C_golddragon:1346130130564808795>`;
        }

        const effect = item.effect ? ` — *${item.effect}*` : '';
        return `➺ ${item.emoji || ''} **${item.name}** ・ ${item.rarity} ${item.type} ・ **${currencyString}**${effect}`;
      }).join('\n');

      return new EmbedBuilder()
        .setTitle('<:servericon:1343229799228899419> ― RPG Market')
        .setDescription(display || '*No items available.*')
        .setFooter({ text: `Page ${page + 1}/${totalPages} | Have your character purchase an item with .marketbuy <character> <item> <quantity>` })
        .setColor('#23272A');
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev_market')
        .setEmoji('<:left:1357664737214857236>')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('next_market')
        .setEmoji('<:right:1357664782827917443>')
        .setStyle(ButtonStyle.Secondary)
    );

    const embed = buildEmbed(currentPage);
    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== message.author.id) return i.reply({ content: 'Only the original user can interact.', ephemeral: true });

      if (i.customId === 'prev_market' && currentPage > 0) currentPage--;
      if (i.customId === 'next_market' && (currentPage + 1) * itemsPerPage < items.length) currentPage++;

      await i.update({ embeds: [buildEmbed(currentPage)], components: [row] });
    });
  }
};