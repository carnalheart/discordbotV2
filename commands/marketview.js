const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MarketItem = require('../models/MarketItem');

const ITEMS_PER_PAGE = 10;

module.exports = {
  name: 'marketview',
  description: 'View the in-character RPG market',

  async execute(message) {
    const items = await MarketItem.find().sort({ name: 1 });
    if (!items.length) {
      return message.channel.send('⚠️ The market is currently empty.');
    }

    let page = 0;

    const generateEmbed = () => {
      const start = page * ITEMS_PER_PAGE;
      const currentItems = items.slice(start, start + ITEMS_PER_PAGE);

      const itemDescriptions = currentItems.map(item => {
        const effectText = item.effect ? ` — *${item.effect}*` : '';
        return `➺ **${item.name}** ・ ${item.type}, ${item.rarity} ・ ${item.value} ${item.currency}${effectText}`;
      }).join('\n');

      return new EmbedBuilder()
        .setTitle('<:servericon:1343229799228899419> ― RPG Market')
        .setDescription(itemDescriptions)
        .setFooter({ text: 'Have your character purchase an item with .marketbuy <character> <item> <quantity>' })
        .setColor('#23272A');
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setEmoji('<:left:1357664737214857236>')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('next')
        .setEmoji('<:right:1357664782827917443>')
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.channel.send({ embeds: [generateEmbed()], components: [row] });

    const collector = msg.createMessageComponentCollector({
      time: 60000,
      filter: i => i.user.id === message.author.id
    });

    collector.on('collect', async interaction => {
      if (interaction.customId === 'prev' && page > 0) page--;
      if (interaction.customId === 'next' && (page + 1) * ITEMS_PER_PAGE < items.length) page++;

      await interaction.update({ embeds: [generateEmbed()], components: [row] });
    });

    collector.on('end', async () => {
      try {
        await msg.edit({ components: [] });
      } catch (e) {
        // ignore
      }
    });
  }
};