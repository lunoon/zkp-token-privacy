const util = require("./util");
const getComputeHash = util.getComputeHash;
const createProofJoin = util.createProofJoin;
const getRegistryEntry = util.getRegistryEntry;
const joinRegistryEntry = util.joinRegistryEntry;

const main = async () => {
  // compute Hash for joined Entry
  const witness = "100";
  const salt = "42";
  const fp0 = "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0d0cd50ef5e084c79bcad658d";
  const fp1 = "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f043ea49c7aa6444a49e3db061"
  // zkp: compute hash
  const witnessId = await getComputeHash(witness, salt);
  console.log(`Witness Id: ${witnessId.data.witnessId}`);
  // verify that fp0 and fp1 exist on-chain with right owner
  console.log("Get Blockchain data for entry 0");
  const entry0 = await getRegistryEntry(fp0);
  console.log(entry0.data);
  console.log("Get Blockchain data for entry 1");
  const entry1 = await getRegistryEntry(fp1);
  console.log(entry1.data);
  // generate Proof with fp0, fp1, witnessId
  console.log("Generating proof:")
  const proof = await createProofJoin(fp0, fp1, witnessId.data.witnessId);
  console.log(proof.data);
  // registry: post joinRegistryEntry 
  console.log("Joining registry entries:");
  const result = await joinRegistryEntry(fp0, fp1, proof.data.proof, witnessId.data.witnessId); // debug here
  console.log(result);
}

main().then(console.log("joining registry entry"));