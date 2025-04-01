require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB!');
}).catch(err => console.error(err));

// Bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 💬 Word-based ping command
client.on('messageCreate', message => {
  if (message.author.bot) return; // Don't respond to other bots

  const msg = message.content.toLowerCase();

  if (msg === 'ping') {
    message.channel.send('pong');
  }
});

client.login(process.env.TOKEN);