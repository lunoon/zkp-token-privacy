const util = require("./util");
const transferRegistryEntry = util.transferRegistryEntry;
const getRegistryEntry = util.getRegistryEntry;
const getRegistryEntryPrivate = util.getRegistryEntryPrivate;

const main = async () => {
  // change only these values:
  fp = "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0d3a7a30159fe4e1cab0cf2cb";
  to = "0x0000000000000000000000000000000000000000"; 
  console.log("Transfering entry:");
  const result = await transferRegistryEntry(fp, to);
  console.log(result.data);
  // use get registry entry on-chain and off-chain data
  console.log("Get data stored on blockchain:")
  const bcData = await getRegistryEntry(fp);
  console.log(bcData.data);
  console.log("Get private data stored in database:");
  const dbData = await getRegistryEntryPrivate(fp);
  console.log(dbData.data);
}

main().then(console.log("transfer registry"));