/* 

Call Verifier contract (Verifier.sol in contracts) with 
the proof created by witness (using zokrates-cli)
to proof knowledge of a preimage to a hash (number hash(number))

*/

const { providers, Contract, Wallet, utils } = require('ethers');

const ganache = new providers.JsonRpcProvider('http://127.0.0.1:8545');

const wallet = new Wallet('480e92fb92ea246104ac2dfd2c80cd4d82a8445b422c9198530915ec9aa26e88', ganache);

const verifierAbi = require('./verifierabi.json');
const verifierAddress = '0x75727d0eF9e7f227F6dcdeE59DC0bB00B175db9a';

const contract = new utils.Interface(verifierAbi); //new Contract(verifierAddress, verifierAbi, ganache);

const inputToVerify = {
  a: [
    '0x00d2a753be5e2bf2f9ef17f1e5449bb554832f57d5b7447bb5bd9cadf0ffae80',
    '0x28318377e79f5b4e5ddee0bd45dfa094451d40c5301d3785d9ed0e13af8fcfd3',
  ],
  b: [
    [
      '0x0a6552e631640280f1e493546c642f6ed54fdd526eb62ea22abbd0fb93be5c49',
      '0x029b254d46ebcf314e910249fe2558c5566f87267700c1764addd0adfc7b62dd',
    ],
    [
      '0x1a2caad35ea233b1f18d66c2e01c3284a842ba8b58a91c3c99c46542a22d5af2',
      '0x2c1e04beae69c84f7f77f28bdf93f0f059686dcb8fea0a5f7aded56d0fbe9057',
    ],
  ],
  c: [
    '0x040a4b39cd0222b3e0037911cc3dc5dbf99b3320660f1381f1bc5a1db1d9968a',
    '0x1c4be351e1bb08be7b030fd37806a8ac62dfa4cad66e4c17e934c47967add7ea',
  ],
};


async function checkVerification() {
  //return await contract.verifyTx(inputToVerify);
  let func_data = contract.encodeFunctionData('verifyTx', [inputToVerify]);
  const rawTx = {
    from: wallet.address,
    nonce: await ganache.getTransactionCount(wallet.address), // this is fetched from server
    to: verifierAddress, // this is the destination address
    gasLimit: undefined,
    gasPrice: await ganache.getGasPrice(),
    value: utils.hexValue(0),
    data: func_data,
  };

  const estimateGas = await ganache.estimateGas(rawTx);

  rawTx.gasLimit = estimateGas;
  console.log(`Gas estimate at ${estimateGas} gas`);
  console.log(rawTx);

  const signedTransaction = await wallet.signTransaction(rawTx);
  console.log(signedTransaction);

  const receipt = await ganache.sendTransaction(signedTransaction);

  // Gas estimate at 237714 gas
}

checkVerification().then(console.log);
// true
