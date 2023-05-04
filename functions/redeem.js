const { ethers } = require("ethers");
const dotenv = require("dotenv");
const { GIFT_CARDS_CONTRACT_ABI } = require('./index.js');

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GIFT_CARDS_CONTRACT_ADDRESS = process.env.GIFT_CARDS_CONTRACT_ADDRESS;

const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const giftCardsContract = new ethers.Contract(GIFT_CARDS_CONTRACT_ADDRESS, GIFT_CARDS_CONTRACT_ABI, wallet);

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);
  const redeemCode = body.redeemCode;
  const address = body.address;

  const nonce = Date.now();
  const message = ethers.utils.hexlify(ethers.utils.concat([ethers.utils.id(redeemCode), ethers.utils.id(String(nonce))]));
  const messageHash = ethers.utils.hashMessage(message);
  const signedMessage = await wallet.signMessage(ethers.utils.arrayify(messageHash));

  const { v, r, s } = ethers.utils.splitSignature(signedMessage);
  try {
    const tx = await giftCardsContract.redeemGiftWithMetaTransaction(redeemCode, nonce, v, r, s, { gasLimit: 200000 });
    const receipt = await tx.wait();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, txHash: receipt.transactionHash }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Failed to redeem gift" }),
    };
  }
};
