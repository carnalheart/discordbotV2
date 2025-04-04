const { EmbedBuilder } = require('discord.js');
const ServerCredit = require('../models/servercredit');

module.exports = {
  name: 'addcredits',
  description: 'Admin only: add server credits to a user',

  async execute(message, args) {
    const roleId = '1343868729997525033';
    if (!message.member.roles.cache.has(roleId)) {
      return message.channel.send('You do not have permission to use this command.');
    }

    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || isNaN(amount) || amount < 1) {
      return message.channel.send('Usage: `.addcredits <@user> <amount>`');
    }

    let data = await ServerCredit.findOne({ userId: user.id });
    if (!data) {
      data = await ServerCredit.create({ userId: user.id, credits: amount });
    } else {
      data.credits += amount;
      await data.save();
    }

    const embed = new EmbedBuilder()
      .setTitle('― Credits Added!')
      .setDescription(`**${amount}** server credits <:C_servercredit:1346130709290422312> were added to **${user.username}**'s balance.`)
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};