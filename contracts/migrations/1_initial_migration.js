const ConfidentialRegistry = artifacts.require('./ConfidentialRegistry');
const Verifier = artifacts.require('zokrates/Verifier.sol')

const fs = require('fs');

module.exports = async function (deployer) {
  await deployer.deploy(Verifier);
  console.log(`Verifier deployed at ${Verifier.address}`)
  await deployer.deploy(ConfidentialRegistry, Verifier.address);
  console.log(`Confidential Registry deployed at ${ConfidentialRegistry.address}`);
  let envString = 'VERIFIER_ADDRESS=' + Verifier.address + '\n';
  envString = envString + 'REGISTRY_ADDRESS=' + ConfidentialRegistry.address + '\n';
  envString = envString + "PRIVATE_KEY='0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1'" + '\n';
  envString = envString + "WALLET_ADDRESS='0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0'" + '\n';
  envString = envString + 'NETWORK_ID=1337' + '\n';
  envString = envString + 'NODE_ENDPOINT=http://zk-ganache:8545/' + '\n';
  envString = envString + "ABI_PATH='../../src/abi/ConfidentialRegistry.json'" + '\n';
  fs.writeFileSync('/opt/zk-contracts/export/config.env', envString, err => console.log(err));
};
