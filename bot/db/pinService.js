const { Pins } = require('../models/pinModel');

async function storePinInMongo(discordUserId, pin) {
  return await Pins.create({
    pin,
    discordUserId,
    isUsed: false,
  });
}

async function findPinByUserId(discordUserId) {
  return await Pins.findOne({ discordUserId });
}

async function findPin(pin) {
  return await Pins.findOne({ pin, isUsed: false });
}

async function markPinUsed(pin) {
  return await Pins.updateOne({ pin }, { isUsed: true });
}

async function expirePin(discordUserId) {
  return await Pins.deleteOne({ discordUserId });
}

module.exports = {
  storePinInMongo,
  findPinByUserId,
  findPin,
  markPinUsed,
  expirePin,
};
