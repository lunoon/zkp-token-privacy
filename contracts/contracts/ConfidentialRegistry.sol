// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './IConfidentialRegistry.sol';
import './zokrates/Verifier.sol';

contract ConfidentialRegistry is IConfidentialRegistry {

  Verifier verifier;

  constructor(address v) {
    verifier = Verifier(v);
  }

  function create(bytes32 fp, uint256 _h0, uint256 _h1) public override {
    // bytes32 fp = keccak256(abi.encode(_h0, _h1)) create fp in backend ffs
    require(entries[fp].owner == address(0), "CF-C-01");
    RegistryEntry memory registryEntry = RegistryEntry({
      owner: msg.sender,
      balanceHash: BalanceHash({ h0: _h0, h1: _h1 })
    });
    entries[fp] = registryEntry;
  }

  function transfer(bytes32 fp, address to) public override {
    require(msg.sender==entries[fp].owner, "CF-T-01");
    entries[fp].owner = to;
  }

  function join(bytes32 sumFp, bytes32 fp0, bytes32 fp1, BalanceHash memory balHashFull, Verifier.Proof memory p) public override {
    require(entries[fp0].owner == msg.sender, "CF-J-01");
    require(entries[fp1].owner == msg.sender, "CF-J-02");
    BalanceHash memory balHash0 = entries[fp0].balanceHash;
    BalanceHash memory balHash1 = entries[fp1].balanceHash;
    // needs Proof memory proof, uint[6] memory input
    require(verifier.verifyTx(p, [balHashFull.h0, balHashFull.h1, balHash0.h0, balHash0.h1, balHash1.h0, balHash1.h1]), "CF-J-03");
    // case für join
    delete entries[fp0];
    delete entries[fp1];

    require(entries[sumFp].owner == address(0), "CF-J-04");
    entries[sumFp] = RegistryEntry({ owner: msg.sender, balanceHash: balHashFull });
  }

  function split(bytes32 sumFp, bytes32 fp0, bytes32 fp1, BalanceHash memory balHash0, BalanceHash memory balHash1, Verifier.Proof memory p) public override {
    // bytes32 fpFull = keccak256(balHashFull.h0, ....) BACKEEEEEEND
    // bytes32 fp1 = keccak256(balHash0.h0, ...)
    // ...
    require(entries[sumFp].owner == msg.sender, "CF-S-01");
    BalanceHash memory balHashFull = entries[sumFp].balanceHash;
    // needs Proof memory proof, uint[6] memory input
    require(verifier.verifyTx(p, [balHashFull.h0, balHashFull.h1, balHash0.h0, balHash0.h1, balHash1.h0, balHash1.h1]), "CF-S-02");
    // case für split
    delete entries[sumFp];

    require(entries[fp0].owner == address(0), "CF-S-03");
    require(entries[fp1].owner == address(0), "CF-S-04");

    entries[fp0] = RegistryEntry({ owner: msg.sender, balanceHash: balHash0 });
    entries[fp1] = RegistryEntry({ owner: msg.sender, balanceHash: balHash1 });
  }

}
