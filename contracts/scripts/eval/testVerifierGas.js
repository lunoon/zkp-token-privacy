/* 

Call Verifier contract (Verifier.sol in contracts) with 
the proof created by witness (using zokrates-cli)
to proof knowledge of a preimage to a hash (number hash(number))

*/

const { providers, Contract, utils, Wallet } = require('ethers');
var Web3 = require('web3');

const ganache = new providers.JsonRpcProvider('http://127.0.0.1:8545');

const wallet = new Wallet('0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c', ganache);


const verifierAbi = require('./verifierabi.json');
const verifierAddress = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab';

const contract = new utils.Interface(verifierAbi); // new Contract(verifierAddress, verifierAbi, ganache);

const proof = {
  "a": [
    "0x1ae4e8215d2580a74d35a574bc0964f0ca2151bf948a0f0d78626427141b3c11",
    "0x17becf1757f3e735ae558a406ae6a399f305f2011b498b791fdd435ee6ae6233"
  ],
  "b": [
    [
      "0x20a4c6f4491ad06a82149594a00596bb13fd29f44fbc8b9d4b2c9c9ad8e0b86e",
      "0x200c7c266731bd6141ab4a3dd65f9b0db3e99af5e1c19a565f254a0cf78ac856"
    ],
    [
      "0x265e08d73ba927d2df5e37104c20f4e713f2a9412e1e62db919425fbc6d57f19",
      "0x2addb3df66b3793fba44800f47e49155b529f320d49ba5fd9994e7baf32b6f83"
    ]
  ],
  "c": [
    "0x149aa819c199a60d244090baa99da5912b94932f289160022c1e02fc743b6e6d",
    "0x1c58331115a18be6b63a80648358c0fe0a8beba6b35f8b5b776e2d5404228768"
  ]
};

// uint[6] input
const inputs = [
  '0x0e1712b3c4e901ed282e63a4158f55d7',
  '0xbbf1390e96aa60bac6e984ccc5377a68',
  '0x7208f7ecafc29faa81d9fe0a87fe0648',
  '0x25a40899695b5caccf10c3f0397d8f28',
  '0xbaab4ba7f93b42dacf8e23502291fe95',
  '0x88f2e304c3616628185daf5fc17aae2d'
];



async function checkVerification() {
  let func_data = contract.encodeFunctionData('verifyTx', [proof,inputs]);
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

}

checkVerification().then(console.log);
// true

// Gas estimate at 300134 gas
