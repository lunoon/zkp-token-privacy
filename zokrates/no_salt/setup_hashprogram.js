const { initialize } = require('zokrates-js');
const fs = require('fs');
const path = require('path');

const hashingProgram =
  'import "hashes/sha256/512bitPacked" as sha256packed; \n \
\n \
def main(private field a, private field b, private field c, private field d) -> field[2] { \n \
    field[2] h = sha256packed([a, b, c, d]); \n \
    return h; \n \
}';

initialize().then((zokratesProvider) => {
  const artifacts = zokratesProvider.compile(hashingProgram);
  console.log(artifacts);

  fs.writeFile(path.resolve(__dirname, '../out/hashingProgram'), hashingProgram, (err) => console.log(err));

  // console.log('run setup');
  // const keypair = zokratesProvider.setup(artifacts.program);
  // console.log(keypair);

  // const savedKeypair = JSON.stringify(keypair);
  // const objJsonB64 = Buffer.from(savedKeypair).toString('base64');

  // let filename = 'hashingKeypair';
  // fs.writeFile(filename, objJsonB64, (err) => console.log(err));
  // read with
  // const decodedRequestBodyString = Buffer.from(objJsonB64, 'base64');
  // const keypairFromB64 = JSON.parse(decodedRequestBodyString);
});
