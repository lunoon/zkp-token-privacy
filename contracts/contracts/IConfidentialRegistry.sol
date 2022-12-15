// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './zokrates/Verifier.sol';

abstract contract IConfidentialRegistry {
  /*
    entry (hash(balance+address)) ->
        address
        balance hash (for verification)
  */

  struct BalanceHash {
    uint256 h0;
    uint256 h1;
  }

  struct RegistryEntry {
    address owner;
    BalanceHash balanceHash;
  }

  mapping(bytes32 => RegistryEntry) public entries;

  function create(bytes32 fp, uint256 _h0, uint256 _h1) public virtual;

  function transfer(bytes32 fp, address to) public virtual;

  function split(bytes32 sumFp, bytes32 fp0, bytes32 fp1, BalanceHash memory balHash0, BalanceHash memory balHash1, Verifier.Proof memory p) public virtual;

  function join(bytes32 sumFp, bytes32 fp0, bytes32 fp1, BalanceHash memory balHashFull, Verifier.Proof memory p) public virtual;
}
