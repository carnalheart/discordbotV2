const mongoose = require('mongoose');

const ServerCreditSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  credits: { type: Number, default: 0 }
});

module.exports = mongoose.model('ServerCredit', ServerCreditSchema);