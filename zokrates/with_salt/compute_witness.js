const { initialize } = require('zokrates-js');
const fs = require('fs');
const path = require('path');

/**
 *  og
 *  change values for input
 *  if no salt should be used leave salt = 0
 */
const input = '20';
const salt = '0';

initialize().then((zokratesProvider) => {
  console.log('compilation of hashing program');

  const source =
    'import "hashes/sha256/512bitPacked" as sha256packed; \n \
\n \
def main(private field a, private field b, private field c, private field d) -> field[2] { \n \
    field[2] h = sha256packed([a, b, c, d]); \n \
    return h; \n \
}';
  const artifacts = zokratesProvider.compile(source);
  // console.log(artifacts);

  console.log('computation of witness');
  const { witness, output } = zokratesProvider.computeWitness(artifacts, [
    '0',
    salt,
    '0',
    input,
  ]);
  const witPrep = { witness, output };
  // write output[0] as h0 and output[1] as h1 to blockchain with registry api
  console.log(output);
});