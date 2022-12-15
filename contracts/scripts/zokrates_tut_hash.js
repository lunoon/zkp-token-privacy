const { initialize } = require('zokrates-js');
const fs = require('fs');

initialize().then((zokratesProvider) => {
  console.log('compilation of program');

  const source =
    'import "hashes/sha256/512bitPacked" as sha256packed; \n \
  \n \
  def main(private field a, private field b, private field c, private field d) { \n \
      field[2] h = sha256packed([a, b, c, d]); \n \
      assert(h[0] == 263561599766550617289250058199814760685); \n \
      assert(h[1] == 65303172752238645975888084098459749904); \n \
      return; \n \
  }';
  const artifacts = zokratesProvider.compile(source);
  console.log(artifacts);

  console.log('computation of witness');
  const { witness, output } = zokratesProvider.computeWitness(artifacts, [
    '0',
    '0',
    '0',
    '5',
  ]);
  console.log({ witness, output });

  // run setup
  // todo use marlin (universal-setup) which is universal and non-malleable
  console.log('run setup');
  const keypair = zokratesProvider.setup(artifacts.program);
  console.log(keypair);

  // const savedKeypair = JSON.stringify(keypair1);
  // const objJsonB64 = Buffer.from(savedKeypair).toString("base64");

  //console.log(objJsonB64);

  // const decodedRequestBodyString = Buffer.from(objJsonB64, "base64");
  // const keypair = JSON.parse(decodedRequestBodyString);

  // generate proof
  console.log('create proof');
  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    keypair.pk,
  );
  console.log(proof);

  // export solidity verifier
  // skip for now
  // const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);

  // or verify off-chain
  console.log('verifying proof');
  const isVerified = zokratesProvider.verify(keypair.vk, proof);
  console.log(isVerified);
});
