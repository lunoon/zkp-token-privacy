// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './IUnconfidentialRegistrySalted.sol';

contract UnconfidentialRegistrySalted is IUnconfidentialRegistrySalted {

  function create(uint256 _balance, uint256 _salt) public override returns (bytes32) {
    // bytes32 fp = keccak256(abi.encode(_h0, _h1)) create fp in backend ffs
    // (bal,s) => ethers.utils.solidityKeccak256(["uint256","uint256"],[bal,s])
    // ethers.utils.solidityKeccak256(["uint256"],[_balance])
    bytes32 fp = keccak256(abi.encode(_balance, _salt));
    require(entries[fp] == address(0), "UF-C-01");
    entries[fp] = msg.sender;
    return fp;
  }

  function transfer(bytes32 fp, address to) public override {
    require(entries[fp]==msg.sender, "UF-T-01");
    entries[fp] = to;
  }

  function join(bytes32 fp0, bytes32 fp1, uint256 sumBalance, uint256 sumSalt, uint256 balance0, uint256 salt0, uint256 balance1, uint256 salt1) public override {
    require(entries[fp0] == msg.sender, "UF-J-01");
    require(entries[fp1] == msg.sender, "UF-J-02");
    require(fp0 != fp1, "UF-J-03");

    require(fp0 == keccak256(abi.encode(balance0, salt0)), "UF-J-04");
    require(fp1 == keccak256(abi.encode(balance1, salt1)), "UF-J-05");

    require(balance0 + balance1 == sumBalance, "UF-J-06");
    require(sumBalance > 0, "UF-J-07");
    require(balance0 > 0, "UF-J-08");
    require(balance1 > 0, "UF-J-09");

    bytes32 sumFp = keccak256(abi.encode(sumBalance, sumSalt));
    require(entries[sumFp] == address(0), "UF-J-10");

    delete entries[fp0];
    delete entries[fp1];

    entries[sumFp] = msg.sender;
  }

  function split(bytes32 sumFp, uint256 sumBalance, uint256 sumSalt, uint256 balance0, uint256 salt0, uint256 balance1, uint256 salt1) public override {
    require(entries[sumFp] == msg.sender, "UF-S-01");

    require(sumFp == keccak256(abi.encode(sumBalance, sumSalt)), "UF-S-02");

    require(balance0 + balance1 == sumBalance, "UF-S-03");
    require(sumBalance > 0, "UF-S-04");
    require(balance0 > 0, "UF-S-05");
    require(balance1 > 0, "UF-S-06");

    bytes32 fp0 = keccak256(abi.encode(balance0, salt0));
    bytes32 fp1 = keccak256(abi.encode(balance1, salt1));

    require(fp0 != fp1, "UF-S-07");
    require(entries[fp0] == address(0), "UF-S-08");
    require(entries[fp1] == address(0), "UF-S-09");
    
    delete entries[sumFp];

    entries[fp0] = msg.sender;
    entries[fp1] = msg.sender;
  }

}
