const { EmbedBuilder } = require('discord.js');
const Character = require('../models/character');

const validCombatTypes = {
  melee: ['strength'],
  ranged: ['dexterity'],
  magic: ['intelligence', 'wisdom'],
  unarmed: ['strength', 'dexterity'],
  mounted: ['wisdom', 'dexterity']
};

module.exports = {
  name: 'battle',
  description: 'Initiate a battle between two characters',

  async execute(message, args) {
    const [typeInput, name1, name2] = args;

    if (!typeInput || !name1 || !name2) {
      return message.channel.send('Usage: `.battle <combat type> <character1> <character2>`');
    }

    const type = typeInput.toLowerCase();
    if (!validCombatTypes[type]) {
      return message.channel.send(`Invalid combat type. Choose one of: ${Object.keys(validCombatTypes).join(', ')}`);
    }

    const char1 = await Character.findOne({ name: new RegExp(`^${name1}$`, 'i') });
    const char2 = await Character.findOne({ name: new RegExp(`^${name2}$`, 'i') });

    if (!char1 || !char2) {
      return message.channel.send('One or both characters could not be found.');
    }

    if (char1.name.toLowerCase() === char2.name.toLowerCase()) {
      return message.channel.send('You must battle **two different characters**.');
    }

    const initiator = message.author.id;
    const challenger = char1.owner === initiator ? char2 : char1;
    const initiatorChar = challenger === char1 ? char2 : char1;

    const consentEmbed = new EmbedBuilder()
      .setTitle('― Battle Initiated!')
      .setDescription(`It looks like **${char1.name}** and **${char2.name}** are going to fight! Do you wish to initiate?`)
      .setFooter({ text: 'Reply with "accept" if you consent to this battle game.' })
      .setColor('#23272A');

    await message.channel.send({
      content: `<@${challenger.owner}>`,
      embeds: [consentEmbed]
    });

    const filter = m =>
      m.author.id === challenger.owner &&
      m.content.toLowerCase() === 'accept';

    try {
      const collected = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 30000,
        errors: ['time']
      });

      const accepted = collected.first();
      if (!accepted) return;

      const statsToUse = validCombatTypes[type];

      const roll = () => Math.floor(Math.random() * 20) + 1;

      const getScore = (character) => {
        const statTotal = statsToUse.reduce((sum, stat) => sum + character.stats[stat], 0);
        return {
          total: statTotal,
          roll: roll()
        };
      };

      const c1Score = getScore(char1);
      const c2Score = getScore(char2);

      const char1Final = c1Score.total + c1Score.roll;
      const char2Final = c2Score.total + c2Score.roll;

      if (char1Final === char2Final || (char1Final < 10 && char2Final < 10)) {
        const drawEmbed = new EmbedBuilder()
          .setTitle('― Battle Result!')
          .setDescription('*Nobody won the fight.* Neither cat rolled a high enough value to win.')
          .setColor('#23272A');
        return message.channel.send({ embeds: [drawEmbed] });
      }

      const winner = char1Final > char2Final ? char1 : char2;
      const loser = winner === char1 ? char2 : char1;
      const winnerTotal = Math.max(char1Final, char2Final);
      const loserTotal = Math.min(char1Final, char2Final);
      const pointDiff = winnerTotal - loserTotal;

      // 🩸 determine damage to loser
      let damage = 0;
      if (pointDiff <= 5) damage = 5;
      else if (pointDiff <= 9) damage = 3;

      if (damage > 0 && loser.hpCurrent !== null) {
        loser.hpCurrent = Math.max(0, loser.hpCurrent - damage);
        await loser.save();
      }

      // 🏆 determine success threshold
      let threshold = '';
      if (winnerTotal < 10) threshold = 'failure';
      else if (winnerTotal < 15) threshold = 'partial success';
      else if (winnerTotal < 20) threshold = 'success';
      else threshold = 'critical success';

      const resultEmbed = new EmbedBuilder()
        .setTitle('― Battle Result!')
        .setDescription(`**${winner.name}** has won the fight! Their success threshold was **${threshold}**.`)
        .setColor('#23272A');

      return message.channel.send({ embeds: [resultEmbed] });

    } catch (err) {
      return message.channel.send(`The battle game was aborted.`);
    }
  }
};