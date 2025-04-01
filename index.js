require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');
const handleReaction = require('./commands/reactionRoles');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel]
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

client.commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

const prefix = '.';

client.on('messageCreate', message => {
  if (message.author.bot) return;

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

  const turnkeyCommand = client.commands.get('turnkey');
  if (message.content === 'turn key' && turnkeyCommand) {
    return turnkeyCommand.execute(message);
  }
});

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

client.login(process.env.TOKEN);