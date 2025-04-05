require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const mongoose = require('mongoose');

const handleReaction = require('./commands/reactionRoles');
const initLogger = require('./logger');
const initWelcomer = require('./welcomer');
const initStickyMessage = require('./stickyMessage');

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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.name) {
    client.commands.set(command.name, command);
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
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

  try {
    initLogger(client);
    initWelcomer(client);
    initStickyMessage(client);
  } catch (err) {
    console.error('❌ Error initializing startup modules:', err);
  }
});

const prefix = '.';

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command || command.isSilent) return;

    try {
      command.execute(message, args);
    } catch (err) {
      console.error(err);
    }
    return;
  }

  // Special message triggers
  const turnkeyCommand = client.commands.get('turnkey');
  if (message.content === 'turn key' && turnkeyCommand) return turnkeyCommand.execute(message);

  const hiatusCommand = client.commands.get('hiatus');
  if ((message.content === '+hiatus' || message.content === '-hiatus') && hiatusCommand)
    return hiatusCommand.execute(message);
});

// Handle reaction roles
client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.partial) {
    reaction.fetch().then(full => handleReaction(full, user, true)).catch(console.error);
  } else {
    handleReaction(reaction, user, true);
  }
});

client.on('messageReactionRemove', (reaction, user) => {
  if (reaction.partial) {
    reaction.fetch().then(full => handleReaction(full, user, false)).catch(console.error);
  } else {
    handleReaction(reaction, user, false);
  }
});

client.login(process.env.TOKEN);