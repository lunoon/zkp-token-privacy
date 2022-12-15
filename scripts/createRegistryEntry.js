const util = require('./util');
const createRegistryEntry = util.createRegistryEntry;
const getComputeHash = util.getComputeHash;
const getRegistryEntry = util.getRegistryEntry;
const getRegistryEntryPrivate = util.getRegistryEntryPrivate;

const main = async () => {
  // change only these values:
  witness = "100";
  salt = "90";

  // zkp: compute hash
  const witnessId = await getComputeHash(witness, salt);
  console.log(`Witness Id: ${witnessId.data.witnessId}`);
  // use witness -> registry: createRegistryEntry
  const result = await createRegistryEntry(witnessId.data.witnessId);
  console.log(result.data);
  // use get registry entry on-chain and off-chain data
  console.log("Get data stored on blockchain:");
  const bcData = await getRegistryEntry(result.data.fp);
  console.log(bcData.data);
  console.log("Get private data stored in database:");
  const dbData = await getRegistryEntryPrivate(result.data.fp);
  console.log(dbData.data);
}

main().then(console.log("create registry entry"));