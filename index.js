require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');
// Updated import: reactionRoles.js is in the commands folder now
const { handleReaction } = require('./commands/reactionRoles');

// Initialize the bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel]
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Load all command files from the commands folder
client.commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// When the bot is ready
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Handle messages
const prefix = '.';

client.on('messageCreate', message => {
  if (message.author.bot) return;

  // Handle prefixed commands like .roll
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      command.execute(message, args);
    } catch (err) {
      console.error(err);
    }
    return;
  }

  // Handle exact phrase "turn key" (case-sensitive)
  const turnkeyCommand = client.commands.get('turnkey');
  if (message.content === 'turn key' && turnkeyCommand) {
    return turnkeyCommand.execute(message);
  }
});

// Reaction role listeners
client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.partial) {
    reaction.fetch()
      .then(full => handleReaction(full, user, true))
      .catch(console.error);
  } else {
    handleReaction(reaction, user, true);
  }
});

client.on('messageReactionRemove', (reaction, user) => {
  if (reaction.partial) {
    reaction.fetch()
      .then(full => handleReaction(full, user, false))
      .catch(console.error);
  } else {
    handleReaction(reaction, user, false);
  }
});

// Log in the bot
client.login(process.env.TOKEN);