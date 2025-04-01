require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');
const handleReaction = require('./commands/reactionRoles');
const initLogger = require('./logger');
const initWelcomer = require('./welcomer');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
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

// Load commands
client.commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: 'over The Seven Kingdoms.',
        type: 3
      }
    ]
  });

  initLogger(client);
  initWelcomer(client);
});

const prefix = '.';

client.on('messageCreate', message => {
  if (message.author.bot) return;

  // Prefixed commands (like .roll)
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

  // "turn key"
  const turnkeyCommand = client.commands.get('turnkey');
  if (message.content === 'turn key' && turnkeyCommand) {
    return turnkeyCommand.execute(message);
  }

  // "+hiatus" / "-hiatus"
  const hiatusCommand = client.commands.get('hiatus');
  if ((message.content === '+hiatus' || message.content === '-hiatus') && hiatusCommand) {
    return hiatusCommand.execute(message);
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