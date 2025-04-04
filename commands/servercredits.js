const { EmbedBuilder } = require('discord.js');
const ServerCredit = require('../models/servercredit');

module.exports = {
  name: 'servercredits',
  description: 'Check your or another user’s server credit balance',

  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;

    let data = await ServerCredit.findOne({ userId: target.id });
    if (!data) {
      data = await ServerCredit.create({ userId: target.id, credits: 0 });
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `― ${target.username}'s Balance`, iconURL: target.displayAvatarURL({ dynamic: true }) })
      .setDescription(`You have **${data.credits}** server credits <:C_servercredit:1346130709290422312>`)
      .setFooter({ text: 'Run .shopview to spend your server credits.' })
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};