const mongoose = require('mongoose');

const ServerCreditSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  credits: { type: Number, default: 0 },
  lastDaily: { type: Date, default: null },
  lastWork: { type: Date, default: null }
});

module.exports = mongoose.model('ServerCredit', ServerCreditSchema);
