const Character = require("../models/character");

module.exports = {
  name: "giveitem",
  description: "Give items from one character to another",
  async execute(message, args) {
    const [itemNameRaw, quantityRaw, giverNameRaw, , receiverNameRaw] = args;
    const itemName = itemNameRaw?.toLowerCase();
    const quantity = parseInt(quantityRaw);
    const giverName = giverNameRaw?.toLowerCase();
    const receiverName = receiverNameRaw?.toLowerCase();

    if (!itemName || !quantity || !giverName || !receiverName || args[3]?.toLowerCase() !== "to") {
      return message.reply("Invalid syntax. Use `.giveitem <item> <quantity> <giver> to <receiver>`.");
    }

    const giver = await Character.findOne({ name: { $regex: new RegExp("^" + giverName + "$", "i") } });
    const receiver = await Character.findOne({ name: { $regex: new RegExp("^" + receiverName + "$", "i") } });

    if (!giver || !receiver) {
      return message.reply("One or both characters could not be found.");
    }

    // Flatten and count giver's inventory
    const inventoryCount = {};
    for (const entry of giver.inventory) {
      for (const [name, qty] of Object.entries(entry)) {
        const lowerName = name.toLowerCase();
        inventoryCount[lowerName] = (inventoryCount[lowerName] || 0) + qty;
      }
    }

    if (!inventoryCount[itemName] || inventoryCount[itemName] < quantity) {
      return message.reply(`${giver.name} does not have enough of that item.`);
    }

    // Remove from giver's inventory
    let remainingToRemove = quantity;
    giver.inventory = giver.inventory.reduce((newInventory, entry) => {
      const [entryName, entryQty] = Object.entries(entry)[0];
      if (entryName.toLowerCase() !== itemName) {
        newInventory.push(entry);
      } else if (entryQty > remainingToRemove) {
        newInventory.push({ [entryName]: entryQty - remainingToRemove });
        remainingToRemove = 0;
      } else {
        remainingToRemove -= entryQty;
      }
      return newInventory;
    }, []);

    // Add to receiver's inventory
    receiver.inventory.push({ [itemNameRaw]: quantity });

    await giver.save();
    await receiver.save();

    return message.channel.send({
      embeds: [{
        title: "― Item Transferred!",
        description: `**${giver.name}** gave **${quantity} ${itemNameRaw}(s)** to **${receiver.name}**.`,
        color: 0x23272A
      }]
    });
  }
};