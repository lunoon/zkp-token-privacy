module.exports = class Zkp {
  zkProvider;
  artifacts;
  keypair;

  constructor(provider, artifacts, keypair) {
    // todo add option for proving scheme/curves
    this.zkProvider = provider;
    this.artifacts = artifacts;
    this.keypair = keypair;
  }

  computeWitness(secret) {
    const { witness, output } = this.zkProvider.computeWitness(
      artifacts,
      secret,
    );
    return witness;
  }

  createProof(witness) {
    const proof = this.zkProvider.generateProof(
      this.artifacts.program,
      witness,
      this.keypair.pk,
    );
    return proof;
  }

  verifyProof(proof) {
    return this.zkProvider.verify(this.keypair.vk, proof);
  }

  exportVerifier() {
    return this.zk.exportSolidityVerifier(this.keypair.vk);
  }
};
