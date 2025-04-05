const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'marketview',
  description: 'View the RPG item market',

  async execute(message) {
    const itemsPerPage = 10;
    const allItems = await MarketItem.find().sort({ name: 1 });
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    let currentPage = 0;

    const formatPrice = (value, currency) => {
      const emojis = {
        copper: '<:C_copperstar:1346130043415298118>',
        silver: '<:C_silverstag:1346130090378920066>',
        gold: '<:C_golddragon:1346130130564808795>'
      };

      const plural = value === 1 ? '' : 's';
      const names = {
        copper: `copper star${plural}`,
        silver: `silver stag${plural}`,
        gold: `gold dragon${plural}`
      };

      return `${value} ${names[currency]} ${emojis[currency]}`;
    };

    const generateEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = allItems.slice(start, end);

      const embed = new EmbedBuilder()
        .setTitle('<:servericon:1343229799228899419> ― RPG Market')
        .setColor('#23272A')
        .setFooter({ text: `Page ${page + 1}/${totalPages} | Have your character purchase an item with .marketbuy <character> <item> <quantity>` });

      for (const item of pageItems) {
        const emoji = item.emoji ?? '';
        const price = formatPrice(item.value, item.currency);
        const effect = item.effect?.trim() || '*no effect.*';
        const rarity = item.rarity?.toLowerCase() ?? 'unknown';
        const category = item.type?.toLowerCase() ?? 'unknown';

        embed.addFields({
          name: `➺ ${emoji} **${item.name}**`,
          value: `・ *class* — ${rarity} ${category}\n・ *price* — ${price}\n・ *effect* — ${effect}`,
          inline: true
        });
      }

      return embed;
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('market_prev')
        .setEmoji('<:left:1357664737214857236>')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('market_next')
        .setEmoji('<:right:1357664782827917443>')
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.channel.send({
      embeds: [generateEmbed(currentPage)],
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({
      time: 60000,
      filter: (i) => i.user.id === message.author.id
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'market_prev') {
        currentPage = currentPage > 0 ? currentPage - 1 : totalPages - 1;
      } else if (interaction.customId === 'market_next') {
        currentPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
      }

      await interaction.update({
        embeds: [generateEmbed(currentPage)],
        components: [row]
      });
    });
  }
};