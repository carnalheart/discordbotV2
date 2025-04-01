const roleMap = {
    // Message 1
    '1345346554008961054': {
      '⚔️': '1343872686518177862',
      '🐉': '1343872719623553024',
      '🏰': '1343872754117513246',
      '🏹': '1343872787898437664',
      '🛡️': '1343872825601167402'
    },
    // Message 2
    '1345346689707282442': {
      'ice:1351465230638780497': '1344285965006667797',
      'wind:1351465752376377406': '1344286003027771462',
      'snowflake:1351466094484918362': '1344286047630004254',
      'snow:1351465993662103632': '1344285863588265994',
      'blue_eye:1351466341734944768': '1344285913642958848'
    },
    // Message 3
    '1345346773228720200': {
      'rhllor:1345343487779934218': '1343870259064475731',
      'martell:1343229162441412721': '1343870360587735080',
      'baratheon:1343229436685713459': '1343870468301787210',
      'tyrell:1343229005507199057': '1343870645506801674',
      'arryn:1343229109714817045': '1343870779795701811',
      'targaryen:1343228904533659669': '1343870998948085880',
      'bolton:1345343187740397630': '1343871402629009488',
      'lannister:1343229396810469418': '1343871494882721893',
      'stark:1343229233929126100': '1343871616844697630'
    },
    // Message 4
    '1345346879868633139': {
      '🏺': '1344348135052542092',
      '🏜️': '1344348177683185695',
      '📿': '1345345280408555550'
    }
  };
  
  function getEmojiKey(emoji) {
    return emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
  }
  
  async function handleReaction(reaction, user, add = true) {
    if (user.bot) return;
  
    const messageId = reaction.message.id;
    const emojiKey = getEmojiKey(reaction.emoji);
    const roleId = roleMap[messageId]?.[emojiKey];
  
    if (!roleId) return;
  
    console.log(`Reaction detected on message ${messageId} with emoji ${emojiKey}`);
  
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id).catch(() => null);
    const role = guild.roles.cache.get(roleId);
  
    if (!member || !role) return;
  
    if (add) {
      member.roles.add(role).catch(console.error);
    } else {
      member.roles.remove(role).catch(console.error);
    }
  }
  
  module.exports = handleReaction;  