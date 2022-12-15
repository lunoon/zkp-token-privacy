const { providers, Contract, ethers } = require('ethers');
const { web3 } = require('Web3');

/*
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

const hash0 = 259054131873386606406206390099085174635;
const hash1 = 63441782530704354556103942065333099277;
const hashFull0 = 240644345464151569938884255059463943729;
const hashFull1 = 298291756676490914499910412681721058767;
*/
const proof = {
  "a": [
    "0x0c578cdf9dddb0b1328cf514ae02d3b02a2e2c1457b424afa4f212a3a9086f0d",
    "0x0e33c53fdfe9f59e8b500060f0397ac9519e322dbe971b336e350006fb353ea7"
  ],
  "b": [
    [
      "0x0dce011eeb15547088f5d1d094a17d7ba5801d61681a703854e0cca4ba122a72",
      "0x0372648c64985f22ddc0d2ee8276d47a46b3b858ad9d82af8ef25d644b3467a4"
    ],
    [
      "0x239b011edfa3ea605abf550e0d0267defce007bd79ac21bf4bc7f053a988ca42",
      "0x10c3706c8cf89faa327c7f4e987cc5c48a99d6900c38caf30431f0a9e8e3f343"
    ]
  ],
  "c": [
    "0x09964c3d17b02de53ebf2007b12f44a7019e6ad43e4afdea1f4ea2ab0551a512",
    "0x088233a92f5102bc4ffcc54fda6753b76a156cd5b674b2c5fb4f4c66cb3266c8"
  ]
};

const inputs = {
  "inputs": [
    "0x000000000000000000000000000000009bcf8a23ea3e406ffd76cc0a326f7a3d",
    "0x000000000000000000000000000000007009c398dca1e9b8c9bb120b0eeb87da",
    "0x00000000000000000000000000000000de83fe37ce9270b0883e6b462ad6eace",
    "0x0000000000000000000000000000000062ef6fd51e3928454b953c27eef8615c",
    "0x0000000000000000000000000000000048446e4459fe97057cf9cd18c316ec0d",
    "0x00000000000000000000000000000000687d2b780f23ae30c60463c394425bc6"
  ]
};


/* 

Call Verifier contract (Verifier.sol in contracts) with 
the proof created by witness (using zokrates-cli)
to proof knowledge of a preimage to a hash (number hash(number))

*/

const ganache = new providers.JsonRpcProvider('http://127.0.0.1:8545');

const verifierAbi = require('./verifierabi_copy.json');
const verifierAddress = '0xf1F3A1746aecdE09Df296ee38a91C64A4ABA3446';

// const wallet = new ethers.Wallet('f03cc1c84ff8b2b42a7ff3b56711ce6b70f86028394d55f0b8036da2d2f4abcd', ganache);

const contract = new Contract(verifierAddress, verifierAbi, ganache);

// const inputToVerify = proof;

// const accounts = await web3.eth.getAccounts();
// const address = '0x456...'; // verifier contract address

// let verifier = new web3.eth.Contract(abi, address, {
//     from: accounts[0], // default from address
//     gasPrice: '20000000000000 // default gas price in wei
// });

// let result = await verifier.methods
//     .verifyTx(proof.proof, proof.inputs)
//     .call({ from: accounts[0] });


async function checkVerification() {
  return await contract.verifyTx(proof, inputs.inputs);
}

checkVerification().then(console.log);
// true

[
  [
    "0x290ee0f756dafc76d672c179d96c9b636e7d17523c98cf9cedfc64efcdcc484b",
    "0x1514305af30042c745ac5dc6c9666012e4f3254416e16aef47b0f1437a2434b8"
  ],
  [
    [
      "0x040489f6fb52cee3abee5d8912a5b591042e543d979b5294ba172a2b3310e971",
      "0x06d6403737c44118e70e2898871e7f18f02ade80071457176d25385f0426218d"
    ],
    [
      "0x1bcd5b47bb3c4cc847ea79a3342aa438931b8ab4e12405343df7e8d7b93e0267",
      "0x13ceafb8143fd1a5702a8566bb13928809d8cb030e4576dbce1ff83a2b6b0fa6"
    ]
  ],
  [
    "0x081221ec6a9da1d04157afd521380e480f3fb9b795f1936adc23fb40fe27a90e",
    "0x13d9d38e0fa69db29efa15352bf426a822ea92ede22857c42036f1f77a6e1520"
  ]
]