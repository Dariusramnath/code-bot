require('dotenv').config();
const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  pin: {
    type: String,
    required: true,
  },
  discordUserId: {
    type: String,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Pins = mongoose.model('Pins', pinSchema);
module.exports = { Pins };
