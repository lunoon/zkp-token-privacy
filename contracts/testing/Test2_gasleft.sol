// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Verifier_test.sol";

contract Test2 {
    address p = 0xa790496eC62c3F18751742F7fe2E55B44e98a628;
    address v = 0x75727d0eF9e7f227F6dcdeE59DC0bB00B175db9a;

    Verifier verifier = Verifier(v);
    //library Pairing p;

    uint a1 = 0x00d2a753be5e2bf2f9ef17f1e5449bb554832f57d5b7447bb5bd9cadf0ffae80;
    uint a2 = 0x28318377e79f5b4e5ddee0bd45dfa094451d40c5301d3785d9ed0e13af8fcfd3;

    uint b11 = 0x0a6552e631640280f1e493546c642f6ed54fdd526eb62ea22abbd0fb93be5c49;
    uint b12 = 0x029b254d46ebcf314e910249fe2558c5566f87267700c1764addd0adfc7b62dd;

    uint b21 = 0x1a2caad35ea233b1f18d66c2e01c3284a842ba8b58a91c3c99c46542a22d5af2;
    uint b22 = 0x2c1e04beae69c84f7f77f28bdf93f0f059686dcb8fea0a5f7aded56d0fbe9057;

    uint c1 = 0x040a4b39cd0222b3e0037911cc3dc5dbf99b3320660f1381f1bc5a1db1d9968a;
    uint c2 = 0x1c4be351e1bb08be7b030fd37806a8ac62dfa4cad66e4c17e934c47967add7ea;

    Pairing.G1Point a = Pairing.G1Point(a1,a2);

    Pairing.G2Point b = Pairing.G2Point([b11,b12],[b21,b22]);

    Pairing.G1Point c = Pairing.G1Point(c1,c2);

    Verifier.Proof public proof = Verifier.Proof(a,b,c);

    /*
    Proof p = ( 
    [
      0x00d2a753be5e2bf2f9ef17f1e5449bb554832f57d5b7447bb5bd9cadf0ffae80,
      0x28318377e79f5b4e5ddee0bd45dfa094451d40c5301d3785d9ed0e13af8fcfd3
    ],
    [
      [
        0x0a6552e631640280f1e493546c642f6ed54fdd526eb62ea22abbd0fb93be5c49,
        0x029b254d46ebcf314e910249fe2558c5566f87267700c1764addd0adfc7b62dd
      ],
      [
        0x1a2caad35ea233b1f18d66c2e01c3284a842ba8b58a91c3c99c46542a22d5af2,
        0x2c1e04beae69c84f7f77f28bdf93f0f059686dcb8fea0a5f7aded56d0fbe9057
      ]
    ],
    [
      0x040a4b39cd0222b3e0037911cc3dc5dbf99b3320660f1381f1bc5a1db1d9968a,
      0x1c4be351e1bb08be7b030fd37806a8ac62dfa4cad66e4c17e934c47967add7ea
    ]
    ); */

    function callVerifier() public returns (uint256) {
        //v.call(bytes4(keccak256("verifyTx(tuple)")), p);
        require(verifier.verifyTx(proof),"T2-CV-01");
        return gasleft();
    }
}

// 0xfA8FeD0BD82d921F069811934032541600d0A62b
// from	0x0a7dAd62a0eB8AcF358f5Cc7456778Bd553EbCE8
// to	Test2.callVerifier() 0xfA8FeD0BD82d921F069811934032541600d0A62b
// gas	249434 gas
// transaction cost	244197 gas 