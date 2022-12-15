/*

prove knowledge of preimage to hash(5)

problem:
witness is empty, steps before seem to work

*/

const { initialize } = require('zokrates-js');

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


// function splitUint256(uint256) {
//   let paddedNum = uint256.toString(2);
//   const missing = '0'.repeat(256 - paddedNum.length);
//   paddedNum = missing + paddedNum;
//   const res = [paddedNum.slice(0, 128), paddedNum.slice(128)];
//   return res.map((p) => parseInt(p, 2).toString());
// }

// python would be like this:
// preimage = bytes.fromhex('00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 05')
// hashlib.sha256(preimage).hexdigest()
// 'c6481e22c5ff4164af680b8cfaa5e8ed3120eeff89c4f307c4a6faaae059ce10'

// async function createHash(secret) {
//   const programPre = await readFile('./preimage.zok');

//   const providerPre = await initialize();

//   const artifactsPre = providerPre.compile(programPre);

//   const { witness, output } = providerPre.computeWitness(artifactsPre, secret);

//   // // grep '~out' witness '~out_0 4\n~out_1 4\n~one 1\n_0 2'
//   let out = output.split('"').map((o) => o.toString());
//   out = [out[1], out[3]];
//   return out;
// }

// async function checkPreimage(secret, hash) {
//   const programHash = await readFile('./hash.zok');
//   const providerHash = await initialize();
//   const artifactsHash = providerHash.compile(programHash);
//   const keypairHash = providerHash.setup(artifactsHash.program);

//   const secretWithHash = secret.concat(hash);
//   console.log(secretWithHash);
//   const { witnessHash, outputHash } = providerHash.computeWitness(
//     artifactsHash,
//     secretWithHash,
//   );

// works until here because witness is empty not returning anything from computation

// const proof = providerHash.generateProof(
//   artifactsHash.program,
//   witnessHash,
//   keypairHash.pk,
// );

// const verifierCheck = zkHash.verifyProof(proof);
//   const verifierCheck = providerHash.verify(keypairHash.vk, proof);

//   return verifierCheck;
// }

// async function executeProtocol(secret) {
//   const out = await createHash(secret);

//   console.log(out);
//   const res = await checkPreimage(secret, out);
//   console.log(res);
//   // qwskjohakdödjlwqnkax
// }

// const input = 5;
// executeProtocol(['0', '0'].concat(splitUint256(input)));

/* 
use https://github.com/Zokrates/ZoKrates/blob/develop/zokrates_js/tests/tests.js
*/

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
  '0', '0', '0',
  '200', '100', '100'
];

initialize().then((zokratesProvider) => {
  const source = splitjoinProgram;

  // compilation
  const artifacts = zokratesProvider.compile(source);

  // computation
  const { witness, output } = zokratesProvider.computeWitness(artifacts, witness_input);

  // run setup
  let keypair = zokratesProvider.setup(artifacts.program);

  console.log(keypair.pk);

  const savedKeypair = JSON.stringify(keypair);
  const objJsonB64 = Buffer.from(savedKeypair).toString('base64');
  const objJsonB64_n = Buffer.from(objJsonB64, 'base64');
  keypair = JSON.parse(objJsonB64_n);

  console.log(keypair.pk)

  // generate proof
  const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
  console.log(JSON.stringify(proof));

  // export solidity verifier
  const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);

  // or verify off-chain
  const isVerified = zokratesProvider.verify(keypair.vk, proof);
  console.log(isVerified);
});
