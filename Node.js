const crypto = require('crypto');

function generateRandomCode() {
  return crypto.randomBytes(16).toString('hex');
}

function generateRedeemCodes(numCodes, numWinners) {
  const redeemCodes = new Map();

  // Generate unique redeem codes
  while (redeemCodes.size < numCodes) {
    const code = generateRandomCode();
    if (!redeemCodes.has(code)) {
      redeemCodes.set(code, false); // false indicates a non-winning code
    }
  }

  // Randomly select winners
  const codesArray = Array.from(redeemCodes.keys());
  for (let i = 0; i < numWinners; i++) {
    const randomIndex = Math.floor(Math.random() * codesArray.length);
    const winnerCode = codesArray.splice(randomIndex, 1)[0];
    redeemCodes.set(winnerCode, true); // true indicates a winning code
  }

  return redeemCodes;
}

const numCodes = 32;
const numWinners = 5;
const redeemCodes = generateRedeemCodes(numCodes, numWinners);

console.log(redeemCodes);
