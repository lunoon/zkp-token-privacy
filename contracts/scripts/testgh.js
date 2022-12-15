const { initialize } = require('zokrates-js');

initialize().then((provider) => {
  const source =
    'import "hashes/sha3/256bit" as sha3            \n \
	        \n \
	    def main(u64 currentTime, private u64[4] expected) -> u64[4]: \n \
	            u64[4] h = sha3([currentTime]) \n \
	            assert(h[0] == expected[0]) \n \
	            assert(h[1] == expected[1]) \n \
	            assert(h[2] == expected[2]) \n \
	            assert(h[3] == expected[3]) \n \
	            return h';

  const artifacts = provider.compile(source);
  const { witness, output } = provider.computeWitness(artifacts, [
    '1643823900',
    [
      '16213210585803108009',
      '8295259912202483971',
      '10491929171841072598',
      '9200200322684122894',
    ],
  ]);
  // Execution failed: Assertion failed at main.zok:5:18
});
