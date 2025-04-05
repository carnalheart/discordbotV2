const Character = require('../models/character');

function toTitleCase(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  name: 'giveitem',
  description: 'Transfer an item between characters.',
  async execute(message, args) {
    const [itemName, qtyStr, giverName, , receiverName] = args;
    const quantity = parseInt(qtyStr);
    if (!itemName || !qtyStr || !giverName || !receiverName || isNaN(quantity)) {
      return message.reply('Usage: `.giveitem <item> <quantity> <giver> to <receiver>`');
    }

    const giver = await Character.findOne({ name: { $regex: `^${giverName}$`, $options: 'i' } });
    const receiver = await Character.findOne({ name: { $regex: `^${receiverName}$`, $options: 'i' } });

    if (!giver || !receiver) return message.reply('⚠️ One of the characters could not be found.');

    const entry = giver.inventory.find(i => Object.keys(i)[0].toLowerCase() === itemName.toLowerCase());
    if (!entry || entry[itemName] < quantity) {
      return message.reply(`${giver.name} does not have enough of that item.`);
    }

    // Remove from giver
    entry[itemName] -= quantity;
    if (entry[itemName] <= 0) {
      giver.inventory = giver.inventory.filter(i => Object.keys(i)[0].toLowerCase() !== itemName.toLowerCase());
    }

    // Add to receiver
    const recvEntry = receiver.inventory.find(i => Object.keys(i)[0].toLowerCase() === itemName.toLowerCase());
    if (recvEntry) {
      recvEntry[itemName] += quantity;
    } else {
      receiver.inventory.push({ [itemName]: quantity });
    }

    await giver.save();
    await receiver.save();

    const embed = {
      title: '― Item Transferred!',
      description: `**${giver.name}** gave **${quantity} ${toTitleCase(itemName)}${quantity > 1 ? 's' : ''}** to **${receiver.name}**.`,
      color: 0x23272A,
    };

    message.channel.send({ embeds: [embed] });
  }
};