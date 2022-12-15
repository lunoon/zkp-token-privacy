/*

zokrates-js tutorial
only working example in nodejs

*/

const { initialize } = require('zokrates-js');
const fs = require('fs');

initialize().then((zokratesProvider) => {
  //const source = "def main(private field a) -> field { return a * a; }";
  let source = fs.readFileSync('./default.zok');
  source = source.toString();

  console.log('compilation of program');
  const artifacts = zokratesProvider.compile(source);
  console.log(artifacts);

  console.log('computation of witness');
  const { witness, output } = zokratesProvider.computeWitness(artifacts, ['2']);
  console.log({ witness, output });

  // run setup
  // todo use marlin (universal-setup) which is universal and non-malleable
  console.log('run setup');
  const keypair = zokratesProvider.setup(artifacts.program);
  console.log(keypair);

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
