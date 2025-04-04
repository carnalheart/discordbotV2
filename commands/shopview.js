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
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);

    const itemList = pageItems.map(item => {
      return `➺ **${item.name}** ・ **${item.value}** server credits <:C_servercredit:1346130709290422312> — ${item.description}`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('<:A_asoiaf_servericon:1343229799228899419> ― Server Shop')
      .setDescription(itemList)
      .setFooter({ text: 'Spend your server credits with .shopbuy <item>' })
      .setColor('#23272A');

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

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'shop_left' && page > 1) page--;
      else if (i.customId === 'shop_right' && page < totalPages) page++;

      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = items.slice(start, end);

      const itemList = pageItems.map(item => {
        return `➺ **${item.name}** ・ **${item.value}** server credits <:C_servercredit:1346130709290422312> — ${item.description}`;
      }).join('\n');

      const updatedEmbed = EmbedBuilder.from(embed).setDescription(itemList);
      await i.update({ embeds: [updatedEmbed], components: [row] });
    });
  }
};