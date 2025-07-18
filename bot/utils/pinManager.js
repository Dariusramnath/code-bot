const pinCache = new Map();

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cachePin(userId, pin) {
  pinCache.set(userId, pin);
  setTimeout(() => pinCache.delete(userId), 1 * 60 * 1000); 
}

function getPin(userId) {
  return pinCache.get(userId);
}

module.exports = {
  generatePin,
  cachePin,
  getPin,
};
