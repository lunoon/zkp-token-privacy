const axios = require("axios");

const sendRequest = async (url, data) => {
  try {
    const response = await axios.post(url, data);
    //console.log(response);
    return response;
  } catch (error) {
    exitNice(error);
  }
}

const getRequest = async (url) => {
  try {
    const response = await axios.get(url);
    //console.log(response);
    return response;
  } catch (error) {
    exitNice(error);
  }
}

const exitNice = (msg) => {
  console.log(msg);
  process.exit(1);
}

// --- ZKP ---

const getComputeHash = async (witness, salt) => {
  const url = "http://localhost:3000/zkp/computeWitnessHash";
  const body = {
    "witness": witness,
    "salt": salt
  };
  return sendRequest(url, body);
}

const getWitnessEntry = async (witnessId) => {
  const url = "http://localhost:3000/zkp/private/witness/";
  return getRequest(url + witnessId);
}

const createProofSplit = async (fpFull, witnessId0, witnessId1) => {
  const url = "http://localhost:3000/zkp/createProofSplit";
  const body = {
    "fpFull": fpFull,
    "witnessId0": witnessId0,
    "witnessId1": witnessId1
  };
  return sendRequest(url, body);
}

const createProofJoin = async (fp0, fp1, witnessId) => {
  const url = "http://localhost:3000/zkp/createProofJoin";
  const body = {
    "fp0": fp0,
    "fp1": fp1,
    "witnessId": witnessId
  };
  return sendRequest(url, body);
}

// --- REGISTRY ---

const createRegistryEntry = async (witnessId) => {
  const url = "http://localhost:3000/registry/createRegistryEntry";
  const body = {
    "witnessId": witnessId
  };
  return sendRequest(url, body);
}

const transferRegistryEntry = async (fp, to) => {
  const url = "http://localhost:3000/registry/transferRegistryEntry";
  const body = {
    "fp": fp,
    "to": to
  }
  return sendRequest(url, body);
}

const splitRegistryEntry = async (fpFull, proof, witnessId0, witnessId1) => {
  const url = "http://localhost:3000/registry/splitRegistryEntry";
  const body = {
    "fpFull": fpFull,
    "proof": proof,
    "witnessId0": witnessId0,
    "witnessId1": witnessId1
  };
  return sendRequest(url, body);
}

const joinRegistryEntry = async (fp0, fp1, proof, witnessId) => {
  const url = "http://localhost:3000/registry/joinRegistryEntry";
  const body = {
    "fp0": fp0,
    "fp1": fp1,
    "proof": proof,
    "witnessId": witnessId
  };
  return sendRequest(url, body);
}

const getRegistryEntry = async (fp) => {
  const url = "http://localhost:3000/registry/fingerprint/";
  return getRequest(url + fp);
}

const getRegistryEntryPrivate = async (fp) => {
  const url = "http://localhost:3000/registry/private/fingerprint/"
  return getRequest(url + fp);
}

module.exports = {
  getComputeHash,
  getWitnessEntry,
  createProofSplit,
  createProofJoin,
  getRegistryEntry,
  getRegistryEntryPrivate,
  createRegistryEntry,
  transferRegistryEntry,
  splitRegistryEntry,
  joinRegistryEntry,
  exitNice
}