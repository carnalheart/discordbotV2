const Character = require('../models/character');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'giveitem',
  description: 'Transfers an item between characters.',

  async execute(message, args) {
    if (args.length < 5 || args[3].toLowerCase() !== 'to') {
      return message.channel.send('Usage: `.giveitem <item> <quantity> <giving character> to <receiving character>`');
    }

    const itemName = args[0].toLowerCase();
    const quantity = parseInt(args[1]);
    const giverName = args[2];
    const receiverName = args[4];

    if (isNaN(quantity) || quantity <= 0) {
      return message.channel.send('Quantity must be a positive number.');
    }

    const giver = await Character.findOne({ name: { $regex: new RegExp(`^${giverName}$`, 'i') } });
    const receiver = await Character.findOne({ name: { $regex: new RegExp(`^${receiverName}$`, 'i') } });

    if (!giver) return message.channel.send(`Character **${giverName}** not found.`);
    if (!receiver) return message.channel.send(`Character **${receiverName}** not found.`);

    // Find the item in giver's inventory
    const giverInventory = giver.inventory || [];
    const itemIndex = giverInventory.findIndex(entry => entry[itemName]);

    if (itemIndex === -1 || giverInventory[itemIndex][itemName] < quantity) {
      return message.channel.send(`${giver.name} does not have enough of that item.`);
    }

    // Remove item from giver
    giverInventory[itemIndex][itemName] -= quantity;
    if (giverInventory[itemIndex][itemName] <= 0) {
      giverInventory.splice(itemIndex, 1);
    }

    // Add item to receiver
    const receiverInventory = receiver.inventory || [];
    const receiverItemIndex = receiverInventory.findIndex(entry => entry[itemName]);

    if (receiverItemIndex === -1) {
      receiverInventory.push({ [itemName]: quantity });
    } else {
      receiverInventory[receiverItemIndex][itemName] += quantity;
    }

    // Save both
    giver.inventory = giverInventory;
    receiver.inventory = receiverInventory;
    await giver.save();
    await receiver.save();

    const embed = new EmbedBuilder()
      .setTitle('― Item Transferred!')
      .setDescription(`**${giver.name}** gave **${quantity} ${itemName}** to **${receiver.name}**.`)
      .setColor('#23272A');

    message.channel.send({ embeds: [embed] });
  }
};