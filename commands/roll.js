const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roll',
  execute(message, args) {
    let input = args[0] || 'd20';
    const diceMatch = input.match(/^(\d*)d(\d+)$/i);

    if (!diceMatch) {
      return message.channel.send("Invalid format! Use `.roll d20` or `.roll 6d20`.");
    }

    const count = parseInt(diceMatch[1] || '1', 10);
    const sides = parseInt(diceMatch[2], 10);

    if (count > 100 || sides > 1000) {
      return message.channel.send("That’s a bit much. Try fewer dice or sides.");
    }

    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const total = rolls.reduce((a, b) => a + b, 0);
    const rollsStr = rolls.join(', ');

    const embed = new EmbedBuilder()
      .setTitle(`― Roll Results`)
      .setColor('#23272A')
      .setDescription(
        count === 1
          ? `**${rolls[0]}**`
          : `**${rollsStr}**`
      );

    message.channel.send({ embeds: [embed] });
  }
};