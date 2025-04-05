const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MarketItem = require('../models/marketitem');

module.exports = {
  name: 'marketview',
  description: 'View the RPG item market',

  async execute(message) {
    const items = await MarketItem.find().sort({ name: 1 });
    const itemsPerPage = 10;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    let currentPage = 0;

    const getPageEmbed = (page) => {
      const start = page * itemsPerPage;
      const currentItems = items.slice(start, start + itemsPerPage);

      const embed = new EmbedBuilder()
        .setTitle('<:servericon:1343229799228899419> ― RPG Market')
        .setFooter({ text: `Page ${page + 1} of ${totalPages} | Have your character purchase an item with .marketbuy <character> <item> <quantity>` })
        .setColor('#23272A')
        .setImage('https://media.discordapp.net/attachments/1344353226123640885/1357754870094102599/RPG-Market-04-04-20252.png?ex=67f15b42&is=67f009c2&hm=a3e13e296a52a708931cc2c075c6d2d6dd6f92e780abfd234aacbd87619bf723&=&format=webp&quality=lossless&width=1280&height=270');

      currentItems.forEach(item => {
        const priceFormatted = formatPrice(item.price, item.currency);
        const effectText = item.effect?.trim() ? item.effect : '*no effect.*';
        embed.addFields({
          name: `➺ ${item.emoji} **${item.name}**`,
          value: `・ *class* — ${item.rarity} ${item.category}\n・ *price* — ${priceFormatted}\n・ *effect* — ${effectText}`,
          inline: true
        });
      });

      return embed;
    };

    const formatPrice = (value, currency) => {
      const plural = value === 1 ? '' : 's';
      const emojiMap = {
        copper: `<:C_copperstar:1346130043415298118>`,
        silver: `<:C_silverstag:1346130090378920066>`,
        gold: `<:C_golddragon:1346130130564808795>`
      };
      const nameMap = {
        copper: `copper star${plural}`,
        silver: `silver stag${plural}`,
        gold: `gold dragon${plural}`
      };
      return `**${value} ${nameMap[currency]}** ${emojiMap[currency]}`;
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev_market')
        .setLabel('<:left:1357664737214857236>')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('next_market')
        .setLabel('<:right:1357664782827917443>')
        .setStyle(ButtonStyle.Secondary)
    );

    const messageReply = await message.channel.send({
      embeds: [getPageEmbed(currentPage)],
      components: [row]
    });

    const collector = messageReply.createMessageComponentCollector({ time: 120000 });

    collector.on('collect', async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: 'Only the command user can change pages.', ephemeral: true });
      }

      if (interaction.customId === 'prev_market') {
        currentPage = currentPage > 0 ? currentPage - 1 : totalPages - 1;
      } else if (interaction.customId === 'next_market') {
        currentPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
      }

      await interaction.update({
        embeds: [getPageEmbed(currentPage)],
        components: [row]
      });
    });

    collector.on('end', () => {
      messageReply.edit({ components: [] }).catch(() => {});
    });
  }
};