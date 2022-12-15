const { initialize } = require('zokrates-js');
const fs = require('fs');
const path = require('path');

/**
 *  da og
 */

const splitjoinProgram =
  'import "hashes/sha256/512bitPacked" as sha256packed; \n \
 \n \
 def main( \
   field hashfulla, \
   field hashfullb, \
   field hashpartial0a, \
   field hashpartial0b, \
   field hashpartial1a, \
   field hashpartial1b, \
   private field saltfull, \
   private field saltpartial0, \
   private field saltpartial1, \
   private field balancefull, \
   private field balancepartial0, \
   private field balancepartial1) { \n \
     field[2] h = sha256packed([0, saltfull, 0, balancefull]); \n \
     assert(h[0] == hashfulla); \n \
     assert(h[1] == hashfullb); \n \
     \n \
     field[2] h0 = sha256packed([0, saltpartial0, 0, balancepartial0]); \n \
     assert(h0[0] == hashpartial0a); \n \
     assert(h0[1] == hashpartial0b); \n \
     \n \
     field[2] h1 = sha256packed([0, saltpartial1, 0, balancepartial1]); \n \
     assert(h1[0] == hashpartial1a); \n \
     assert(h1[1] == hashpartial1b); \n \
     \n \
     assert(balancefull > 0); \n \
     assert(balancepartial0 > 0); \n \
     assert(balancepartial1 > 0); \n \
     assert(balancefull == balancepartial0 + balancepartial1); \n \
     return; \n \
}';

/**
 *  join 100 + 100
 */

// const hash0 = '259054131873386606406206390099085174635';
// const hash1 = '63441782530704354556103942065333099277'
// const hashFull0 = '240644345464151569938884255059463943729';
// const hashFull1 = '298291756676490914499910412681721058767'

// const witness_input = [
//   hashFull0, hashFull1,
//   hash0, hash1,
//   hash0, hash1,
//   '0', '0', '0',
//   '200', '100', '100'
// ];

/**
 *  split 100/s19
 *  into 40/s19 + 60/s10
 *
 */

// const hashFull0 = '207107946614384411545284586190817688125';
// const hashFull1 = '148924233380473248395576669818487277530';
// const balanceFull = '100';
// const saltFull = '19';

// const hashA0 = "295773962106238599367160173224890133198";
// const hashA1 = "131507570768529849460802213362965963100";
// const balanceA = '40';
// const saltA = '19';

// const hashB0 = "96059728363317709992395687697197755405";
// const hashB1 = "138889630324625973111598049386773502918";
// const balanceB = '60';
// const saltB = '19';

const hashFull0 = "273942955402227242845151167392351365183";
const hashFull1 = "209863717348661788809700235508684412611";

const hashA0 = "274043217306813196715292374878587193480";
const hashA1 = "110023891071827327882702786425903802345";

const hashB0 = "15771818132770544820564520537693710436";
const hashB1 = "259482361807049816715998585663515840621";

const saltFull = '20';
const balanceFull = '40';
const saltA = '20';
const saltB = '20';
const balanceA = '10';
const balanceB = '30';

// doesnt change from here on
const witness_input = [
  hashFull0, hashFull1,
  hashA0, hashA1,
  hashB0, hashB1,
  saltFull, saltA, saltB,
  balanceFull, balanceA, balanceB
];

// however this is joining A and B again ???

// initialize().then((zokratesProvider) => {
//   const artifacts = zokratesProvider.compile(splitjoinProgram);

//   const savedKeypair = fs.readFileSync(path.resolve(__dirname, '../out/splitjoinKeypair'), 'utf8');
//   const objJsonB64 = Buffer.from(savedKeypair, 'base64');
//   const keypair = JSON.parse(objJsonB64);

//   const witness = zokratesProvider.computeWitness(artifacts, witness_input);
//   //console.log(witness);

//   console.log(keypair);

//   console.log('create proof');
//   const proof = zokratesProvider.generateProof(
//     artifacts.program,
//     witness,
//     keypair.pk,
//   );
//   console.log(proof);

//   // for registry api
//   const savedProof = JSON.stringify(proof);
//   const proofB64 = Buffer.from(savedProof).toString('base64');
//   console.log(JSON.stringify(proofB64));

//   console.log('verifying proof');
//   const isVerified = zokratesProvider.verify(keypair.vk, proof);

//   console.log(isVerified);

//   /**
//    * bc
//    * contract.verifyTx(proof.proof, proof.inputs)
//    */

// });

initialize().then((zokratesProvider) => {
  const source = splitjoinProgram;

  // compilation
  const artifacts = zokratesProvider.compile(source);

  // computation
  const { witness, output } = zokratesProvider.computeWitness(artifacts, witness_input);

  // run setup
  //let keypair = zokratesProvider.setup(artifacts.program);

  const savedKeypair = fs.readFileSync(path.resolve(__dirname, '../out/splitjoinKeypair'), 'utf8');
  const objJsonB64_n = Buffer.from(savedKeypair, 'base64').toString();
  keypair = JSON.parse(objJsonB64_n);

  console.log(keypair.pk)

  // generate proof
  const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
  console.log(JSON.stringify(proof.proof));

  // export solidity verifier
  const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);

  // or verify off-chain
  const isVerified = zokratesProvider.verify(keypair.vk, proof);
  console.log(isVerified);
});