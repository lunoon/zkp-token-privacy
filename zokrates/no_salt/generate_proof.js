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
   private field balancefull, \
   private field balancepartial0, \
   private field balancepartial1) { \n \
     field[2] h = sha256packed([0, 0, 0, balancefull]); \n \
     assert(h[0] == hashfulla); \n \
     assert(h[1] == hashfullb); \n \
     \n \
     field[2] h0 = sha256packed([0, 0, 0, balancepartial0]); \n \
     assert(h0[0] == hashpartial0a); \n \
     assert(h0[1] == hashpartial0b); \n \
     \n \
     field[2] h1 = sha256packed([0, 0, 0, balancepartial1]); \n \
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
const hash0 = '259054131873386606406206390099085174635';
const hash1 = '63441782530704354556103942065333099277'
const hashFull0 = '240644345464151569938884255059463943729';
const hashFull1 = '298291756676490914499910412681721058767'

const witness_input = [
  hashFull0, hashFull1,
  hash0, hash1,
  hash0, hash1,
  '200', '100', '100'
];

initialize().then((zokratesProvider) => {
  const artifacts = zokratesProvider.compile(splitjoinProgram);

  const savedKeypair = fs.readFileSync(path.resolve(__dirname, '../out/splitjoinKeypair'), 'utf8');
  const objJsonB64 = Buffer.from(savedKeypair, 'base64');
  const keypair = JSON.parse(objJsonB64);

  const witness = zokratesProvider.computeWitness(artifacts, witness_input);

  console.log('create proof');
  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    keypair.pk,
  );
  console.log(proof);

  // for registry api
  const savedProof = JSON.stringify(proof);
  const proofB64 = Buffer.from(savedProof).toString('base64');
  console.log(proofB64);

  console.log('verifying proof');
  const isVerified = zokratesProvider.verify(keypair.vk, proof);

  console.log(isVerified);

});
