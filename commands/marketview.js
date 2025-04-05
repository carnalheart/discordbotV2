const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MarketItem = require('../models/marketitem');

const ITEMS_PER_PAGE = 10;

function formatPrice(value, currency) {
  const emojiMap = {
    copper: '<:C_copperstar:1346130043415298118>',
    silver: '<:C_silverstag:1346130090378920066>',
    gold: '<:C_golddragon:1346130130564808795>',
  };

  if (!value || !currency || !emojiMap[currency]) return '*undefined*';

  const plural = value === 1 ? '' : 's';
  const nameMap = {
    copper: `copper star${plural}`,
    silver: `silver stag${plural}`,
    gold: `gold dragon${plural}`,
  };

  return `**${value} ${nameMap[currency]}** ${emojiMap[currency]}`;
}

module.exports = {
  name: 'marketview',
  description: 'Displays the RPG market',

  async execute(message) {
    const items = await MarketItem.find().sort({ name: 1 });

    if (!items.length) {
      return message.channel.send('No market items found.');
    }

    let currentPage = 0;

    const getPageEmbed = (page) => {
      const embed = new EmbedBuilder()
        .setTitle('<:servericon:1343229799228899419> ― RPG Market')
        .setColor('#23272A');

      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const currentItems = items.slice(start, end);

      currentItems.forEach(item => {
        const emoji = item.emoji || '❔';
        const name = item.name || 'Unnamed Item';
        const rarity = item.rarity || 'unknown';
        const category = item.category || 'item';
        const effect = item.effect?.trim() || '*no effect.*';

        const priceFormatted = (typeof item.value === 'number' && item.currency)
          ? formatPrice(item.value, item.currency)
          : '*undefined*';

        embed.addFields({
          name: `➺ ${emoji} **${name}**`,
          value: `・ *class* — ${rarity} ${category}\n・ *price* — ${priceFormatted}\n・ *effect* — ${effect}`,
          inline: false
        });
      });

      const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
      embed.setFooter({ text: `Page ${page + 1}/${totalPages} | Have your character purchase an item with .marketbuy <character> <item> <quantity>` });

      return embed;
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prevPage')
        .setLabel('')
        .setEmoji('<:left:1357664737214857236>')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('nextPage')
        .setLabel('')
        .setEmoji('<:right:1357664782827917443>')
        .setStyle(ButtonStyle.Secondary)
    );

    const messageReply = await message.channel.send({
      embeds: [getPageEmbed(currentPage)],
      components: [row]
    });

    const collector = messageReply.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) return interaction.reply({ content: 'Only the command user can interact with this menu.', ephemeral: true });

      if (interaction.customId === 'prevPage') {
        currentPage = currentPage > 0 ? currentPage - 1 : Math.ceil(items.length / ITEMS_PER_PAGE) - 1;
      } else if (interaction.customId === 'nextPage') {
        currentPage = (currentPage + 1) % Math.ceil(items.length / ITEMS_PER_PAGE);
      }

      await interaction.update({
        embeds: [getPageEmbed(currentPage)],
        components: [row]
      });
    });
  }
};