const util = require("./util");
const getComputeHash = util.getComputeHash;
const createProofSplit = util.createProofSplit;
const getRegistryEntry = util.getRegistryEntry;
const splitRegistryEntry = util.splitRegistryEntry;

const main = async () => {
  // compute Hash for joined Entry
  const witness0 = "60";
  const salt0 = "0";
  const witness1 = "40"
  const salt1 = "1"
  const fpFull = "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0485785a9b3e3458fb6ca53fc";
  // zkp: compute hash
  console.log("Computing hashes:");
  const witnessId0 = await getComputeHash(witness0, salt0);
  console.log(`Witness Id 0: ${witnessId0.data.witnessId}`);
  const witnessId1 = await getComputeHash(witness1, salt1);
  console.log(`Witness Id 1: ${witnessId1.data.witnessId}`);
  // verify that fp exists on-chain with right owner
  console.log("Get Blockchain data for entry");
  const entry = await getRegistryEntry(fpFull);
  console.log(entry.data);
  // generate Proof with fp, witnessId0, witnessId1
  console.log("Generating proof:")
  const proof = await createProofSplit(fpFull, witnessId0.data.witnessId, witnessId1.data.witnessId);
  // registry: post joinRegistryEntry 
  console.log("Splitting registry entries:")
  const result = await splitRegistryEntry(fpFull, proof.data.proof, witnessId0.data.witnessId, witnessId1.data.witnessId); // debug here
  console.log(result);
}

main().then(console.log("split registry entry"));