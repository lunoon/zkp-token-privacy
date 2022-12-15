const { initialize } = require('zokrates-js');
const fs = require('fs');
const path = require('path');

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

initialize().then((zokratesProvider) => {
  const artifacts = zokratesProvider.compile(splitjoinProgram);
  console.log(artifacts);

  fs.writeFile(path.resolve(__dirname, '../out_nosalt/splitjoinProgram'), splitjoinProgram, (err) => console.log(err));

  console.log('run setup');
  const keypair = zokratesProvider.setup(artifacts.program);
  console.log(keypair);

  const savedKeypair = JSON.stringify(keypair);
  const objJsonB64 = Buffer.from(savedKeypair).toString('base64');

  fs.writeFile(path.resolve(__dirname, '../out_nosalt/splitjoinKeypair'), objJsonB64, (err) => console.log(err));

  const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
  fs.writeFile(path.resolve(__dirname, '../out_nosalt/Verifier.sol'), verifier, (err) => console.log(err));
  // read with
  // const decodedRequestBodyString = Buffer.from(objJsonB64, 'base64');
  // const keypairFromB64 = JSON.parse(decodedRequestBodyString);
});
