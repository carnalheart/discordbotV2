const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ShopItem = require('../models/shopitem');

module.exports = {
  name: 'shopview',
  description: 'View the out-of-character server shop',

  async execute(message) {
    const items = await ShopItem.find().sort({ name: 1 });
    const itemsPerPage = 10;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    let page = 1;

    const buildEmbed = (page) => {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = items.slice(start, end);

      const itemList = pageItems.map(item => {
        return `➺ **${item.name}** ・ **${item.value}** server credits <:C_servercredit:1346130709290422312> — ${item.description}`;
      }).join('\n');

      return new EmbedBuilder()
        .setTitle('― Server Shop')
        .setDescription(itemList)
        .setImage('https://media.discordapp.net/attachments/1344353226123640885/1357754680725209338/Server-Shop-04-04-2025.png?ex=67f15b15&is=67f00995&hm=de74756cd297e77d9d3bec7e9f0ddc854a47e6c2af3d4179df0dc2e80c5d3c9b&=&format=webp&quality=lossless&width=1280&height=291')
        .setFooter({ text: 'Spend your server credits with .shopbuy <item>' })
        .setColor('#23272A');
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('shop_left')
        .setEmoji('<:left:1357664737214857236>')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('shop_right')
        .setEmoji('<:right:1357664782827917443>')
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.channel.send({ embeds: [buildEmbed(page)], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'shop_left' && page > 1) page--;
      else if (i.customId === 'shop_right' && page < totalPages) page++;

      await i.update({ embeds: [buildEmbed(page)], components: [row] });
    });
  }
};