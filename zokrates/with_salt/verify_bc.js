const { providers, Contract } = require('ethers');

const proof = {
  "scheme": "g16",
  "curve": "bn128",
  "proof": {
    "a": [
      "0x290ee0f756dafc76d672c179d96c9b636e7d17523c98cf9cedfc64efcdcc484b",
      "0x1514305af30042c745ac5dc6c9666012e4f3254416e16aef47b0f1437a2434b8"
    ],
    "b": [
      [
        "0x040489f6fb52cee3abee5d8912a5b591042e543d979b5294ba172a2b3310e971",
        "0x06d6403737c44118e70e2898871e7f18f02ade80071457176d25385f0426218d"
      ],
      [
        "0x1bcd5b47bb3c4cc847ea79a3342aa438931b8ab4e12405343df7e8d7b93e0267",
        "0x13ceafb8143fd1a5702a8566bb13928809d8cb030e4576dbce1ff83a2b6b0fa6"
      ]
    ],
    "c": [
      "0x081221ec6a9da1d04157afd521380e480f3fb9b795f1936adc23fb40fe27a90e",
      "0x13d9d38e0fa69db29efa15352bf426a822ea92ede22857c42036f1f77a6e1520"
    ]
  },
  "inputs": [
    "0x00000000000000000000000000000000b50a6a432fcb4d7254ac3fc08338b631",
    "0x00000000000000000000000000000000e068e713118a6ff2ab3c1894962a95cf",
    "0x00000000000000000000000000000000c2e402cf88bcbe6ab09f882ebe79276b",
    "0x000000000000000000000000000000002fba715fefa3ff8efa9e26dbefd65b0d",
    "0x00000000000000000000000000000000c2e402cf88bcbe6ab09f882ebe79276b",
    "0x000000000000000000000000000000002fba715fefa3ff8efa9e26dbefd65b0d"
  ]
}

/* 

Call Verifier contract (Verifier.sol in contracts) with 
the proof created by witness (using zokrates-cli)
to proof knowledge of a preimage to a hash (number hash(number))

*/

const ganache = new providers.JsonRpcProvider('http://127.0.0.1:8545');

const verifierAbi = require('./verifier_abi.json');
const verifierAddress = '0xf1F3A1746aecdE09Df296ee38a91C64A4ABA3446';

const contract = new Contract(verifierAddress, verifierAbi, ganache);

const inputToVerify = proof;

async function checkVerification() {
  return await contract.verifyTx(inputToVerify.proof,inputToVerify.inputs);
}

checkVerification().then(console.log);
// true
