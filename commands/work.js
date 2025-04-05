const { EmbedBuilder } = require('discord.js');
const ServerCredit = require('../models/servercredit');

const messages = [
  'caught and sold a basket of fish',
  'spied for the Master Of Whisperers',
  'sold their sword',
  'worked the local tavern\'s bar',
  'delivered milk to the townsfolk',
  'cremated corpses after a lost battle',
  'scribed for a high lord',
  'gathered firewood',
  'crafted and sold a dragon saddle',
  'squired for a knight',
  'performed a ballad in the local tavern',
  'delivered a royal pardon',
  'sent the ravens',
  'assisted the Maesters of the Citadel with alchemy',
  'collected taxes',
  'worked as the Queen\'s handmaiden',
  'tutored a highborn child'
];

const cooldown = 6 * 60 * 60 * 1000;

module.exports = {
  name: 'work',
  description: 'Perform a job to earn server credits',

  async execute(message) {
    const userId = message.author.id;
    const now = Date.now();

    let data = await ServerCredit.findOne({ userId });
    if (!data) {
      data = await ServerCredit.create({
        userId,
        credits: 0,
        lastWork: 0
      });
    }

    const lastUsed = data.lastWork ? new Date(data.lastWork).getTime() : 0;

    if (now - lastUsed < cooldown) {
      const next = new Date(lastUsed + cooldown).toLocaleString();
      return message.channel.send(`⏳ You can use \`.work\` again at **${next}**.`);
    }

    const reward = Math.floor(Math.random() * 91) + 10;
    data.credits += reward;
    data.lastWork = now;
    await data.save();

    const action = messages[Math.floor(Math.random() * messages.length)];

    const embed = new EmbedBuilder()
      .setTitle('― Work Complete!')
      .setDescription(`<@${userId}> ${action} and earned **${reward}** server credits <:C_servercredit:1346130709290422312>`)
      .setFooter({ text: `Run .servercredits to view your balance. | Next .work: ${new Date(now + cooldown).toLocaleString()}` })
      .setColor('#23272A');

    return message.channel.send({ embeds: [embed] });
  }
};