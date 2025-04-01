const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberAdd', member => {
    // Auto-assign roles
    const roleIds = [
      '1343869375182012456',
      '1343872948062392321',
      '1343873075279691826',
      '1356705137686614257'
    ];

    roleIds.forEach(roleId => {
      const role = member.guild.roles.cache.get(roleId);
      if (role) {
        member.roles.add(role).catch(console.error);
      }
    });

    // Welcome embed
    const welcomeChannelId = '1343208558677856356';
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('<:servericon:1343229799228899419> ― 𝑾𝒆𝒍𝒄𝒐𝒎𝒆!')
      .setDescription(`**Welcome ${member}** to **A Song Of Ice And Fire**! Please thoroughly read through our <#1343211508305362954> and <#1343212020912357378> channels before attempting to **verify** yourself. These channels contain **2 hidden passwords** that you must enter into <#1343214370179776613> in order to **access** the server.`)
      .setColor(0x23272A)
      .setImage('https://media.discordapp.net/attachments/1340296826653249616/1345291481124048951/Welcome-01-03-2025.png?ex=67ed8b13&is=67ec3993&hm=3ea13732c2a548fd7f79ee60be6b827073021c38e4e405ef54a531192363af9a&=&format=webp&quality=lossless&width=1280&height=331')
      .setFooter({ text: 'This server is strictly 18+. We kindly ask that you promptly leave if you are underaged.' });

    channel.send({ embeds: [embed] }).catch(console.error);
  });
};