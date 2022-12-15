// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

abstract contract IUnconfidentialRegistry {
  /*
    entry (hash(balance+address)) ->
        address
        balance hash (for verification)
  */

  mapping(bytes32 => address) public entries;

  function create(uint256 _balance) public virtual returns (bytes32);

  function transfer(bytes32 fp, address to) public virtual;

  function join(bytes32 fp0, bytes32 fp1, uint256 sumBalance, uint256 balance0, uint256 balance1) public virtual;

  function split(bytes32 sumFp, uint256 sumBalance, uint256 balance0, uint256 balance1) public virtual;

}
