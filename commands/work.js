const { EmbedBuilder } = require('discord.js');
const ServerCredit = require('../models/servercredit');

const messages = [
  'caught and sold a basket of fish.',
  'spied for the Master Of Whisperers.',
  'sold their sword.',
  'worked the local tavern\'s bar.',
  'delivered milk to the townsfolk.',
  'cremated corpses after a lost battle.',
  'scribed for a high lord.',
  'gathered firewood.',
  'crafted and sold a dragon saddle.',
  'squired for a knight.',
  'performed a ballad in the local tavern.',
  'delivered a royal pardon.',
  'sent the ravens.',
  'assisted the Maesters of the Citadel with alchemy.',
  'collected taxes.',
  'worked as the Queen\'s handmaiden.',
  'tutored a highborn child.'
];

const cooldowns = new Map();

module.exports = {
  name: 'work',
  description: 'Do a task to earn server credits (once every 6h)',

  async execute(message) {
    const userId = message.author.id;
    const now = Date.now();
    const cooldown = 6 * 60 * 60 * 1000;

    const lastUsed = cooldowns.get(userId);
    if (lastUsed && now - lastUsed < cooldown) {
      const nextTime = new Date(lastUsed + cooldown).toLocaleString();
      return message.channel.send(`You’ve already worked recently. Next job: **${nextTime}**.`);
    }

    cooldowns.set(userId, now);

    const reward = Math.floor(Math.random() * 91) + 10;
    const chosen = messages[Math.floor(Math.random() * messages.length)];

    let data = await ServerCredit.findOne({ userId });
    if (!data) {
      data = await ServerCredit.create({ userId, credits: reward });
    } else {
      data.credits += reward;
      await data.save();
    }

    const embed = new EmbedBuilder()
      .setTitle('― Work Complete!')
      .setDescription(`<@${userId}> ${chosen} and earned **${reward}** server credits <:C_servercredit:1346130709290422312>`)
      .setFooter({ text: `Run .balance to view your balance. | Next .work: ${new Date(now + cooldown).toLocaleString()}` })
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};