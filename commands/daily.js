const { EmbedBuilder } = require('discord.js');
const ServerCredit = require('../models/servercredit');

const messages = [
  'delivered a dragonglass blade to Castle Black',
  'prayed to The Seven',
  'scaled the wall of the Red Keep',
  'completed the walk of shame',
  'drank mead with the royal family',
  'chased cats in Kings Landing',
  'crossed the Narrow Sea',
  'hatched a stone dragon egg',
  'won a jousting tourney',
  'found a hidden map leading them to a secret treasure chest'
];

const cooldowns = new Map();

module.exports = {
  name: 'daily',
  description: 'Collect a daily allowance of server credits',

  async execute(message) {
    const userId = message.author.id;
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    const lastUsed = cooldowns.get(userId);
    if (lastUsed && now - lastUsed < cooldown) {
      const nextTime = new Date(lastUsed + cooldown).toLocaleString();
      return message.channel.send(`You’ve already collected your daily allowance. Next daily: **${nextTime}**.`);
    }

    cooldowns.set(userId, now);

    const reward = 100;
    const chosen = messages[Math.floor(Math.random() * messages.length)];

    let data = await ServerCredit.findOne({ userId });
    if (!data) {
      data = await ServerCredit.create({ userId, credits: reward });
    } else {
      data.credits += reward;
      await data.save();
    }

    const embed = new EmbedBuilder()
      .setTitle('― Daily Allowance Collected!')
      .setDescription(`<@${userId}> ${chosen} and earned **${reward}** server credits <:C_servercredit:1346130709290422312>`)
      .setFooter({ text: `Run .balance to view your balance. | Next .daily: ${new Date(now + cooldown).toLocaleString()}` })
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};