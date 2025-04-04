const { EmbedBuilder } = require('discord.js');
const ServerCredit = require('../models/servercredit');

const messages = [
  'delivered a dragonglass blade to Castle Black.',
  'prayed to The Seven.',
  'scaled the wall of the Red Keep.',
  'completed the walk of shame.',
  'drank mead with the royal family.',
  'chased cats in Kings Landing.',
  'crossed the Narrow Sea.',
  'hatched a stone dragon egg.',
  'won a jousting tourney.',
  'found a hidden map leading them to a secret treasure chest.'
];

const cooldown = 24 * 60 * 60 * 1000;

module.exports = {
  name: 'daily',
  description: 'Collect your daily server credit allowance',

  async execute(message) {
    const userId = message.author.id;
    const now = Date.now();

    let data = await ServerCredit.findOne({ userId });
    if (!data) {
      data = await ServerCredit.create({
        userId,
        credits: 0,
        lastDaily: 0
      });
    }

    const lastUsed = data.lastDaily ? new Date(data.lastDaily).getTime() : 0;

    if (now - lastUsed < cooldown) {
      const next = new Date(lastUsed + cooldown).toLocaleString();
      return message.channel.send(`⏳ You can use \`.daily\` again at **${next}**.`);
    }

    data.credits += 100;
    data.lastDaily = now;
    await data.save();

    const action = messages[Math.floor(Math.random() * messages.length)];

    const embed = new EmbedBuilder()
      .setTitle('― Daily Allowance Collected!')
      .setDescription(`<@${userId}> ${action} and earned **100** server credits <:C_servercredit:1346130709290422312>`)
      .setFooter({ text: `Run .servercredits to view your balance. | Next .daily: ${new Date(now + cooldown).toLocaleString()}` })
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};