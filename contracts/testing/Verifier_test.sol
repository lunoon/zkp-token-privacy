// SPDX-License-Identifier: MIT
// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;

library Pairing {
  struct G1Point {
    uint256 X;
    uint256 Y;
  }
  // Encoding of field elements is: X[0] * z + X[1]
  struct G2Point {
    uint256[2] X;
    uint256[2] Y;
  }

  /// @return the generator of G1
  function P1() internal pure returns (G1Point memory) {
    return G1Point(1, 2);
  }

  /// @return the generator of G2
  function P2() internal pure returns (G2Point memory) {
    return
      G2Point(
        [
          10857046999023057135944570762232829481370756359578518086990519993285655852781,
          11559732032986387107991004021392285783925812861821192530917403151452391805634
        ],
        [
          8495653923123431417604973247489272438418190587263600148770280649306958101930,
          4082367875863433681332203403145435568316851327593401208105741076214120093531
        ]
      );
  }

  /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
  function negate(G1Point memory p) internal pure returns (G1Point memory) {
    // The prime q in the base field F_q for G1
    uint256 q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
    if (p.X == 0 && p.Y == 0) return G1Point(0, 0);
    return G1Point(p.X, q - (p.Y % q));
  }

  /// @return r the sum of two points of G1
  function addition(G1Point memory p1, G1Point memory p2)
    internal
    view
    returns (G1Point memory r)
  {
    uint256[4] memory input;
    input[0] = p1.X;
    input[1] = p1.Y;
    input[2] = p2.X;
    input[3] = p2.Y;
    bool success;
    assembly {
      success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
      // Use "invalid" to make gas estimation work
      switch success
      case 0 {
        invalid()
      }
    }
    require(success);
  }

  /// @return r the product of a point on G1 and a scalar, i.e.
  /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
  function scalar_mul(G1Point memory p, uint256 s)
    internal
    view
    returns (G1Point memory r)
  {
    uint256[3] memory input;
    input[0] = p.X;
    input[1] = p.Y;
    input[2] = s;
    bool success;
    assembly {
      success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
      // Use "invalid" to make gas estimation work
      switch success
      case 0 {
        invalid()
      }
    }
    require(success);
  }

  /// @return the result of computing the pairing check
  /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
  /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
  /// return true.
  function pairing(G1Point[] memory p1, G2Point[] memory p2)
    internal
    view
    returns (bool)
  {
    require(p1.length == p2.length);
    uint256 elements = p1.length;
    uint256 inputSize = elements * 6;
    uint256[] memory input = new uint256[](inputSize);
    for (uint256 i = 0; i < elements; i++) {
      input[i * 6 + 0] = p1[i].X;
      input[i * 6 + 1] = p1[i].Y;
      input[i * 6 + 2] = p2[i].X[1];
      input[i * 6 + 3] = p2[i].X[0];
      input[i * 6 + 4] = p2[i].Y[1];
      input[i * 6 + 5] = p2[i].Y[0];
    }
    uint256[1] memory out;
    bool success;
    assembly {
      success := staticcall(
        sub(gas(), 2000),
        8,
        add(input, 0x20),
        mul(inputSize, 0x20),
        out,
        0x20
      )
      // Use "invalid" to make gas estimation work
      switch success
      case 0 {
        invalid()
      }
    }
    require(success);
    return out[0] != 0;
  }

  /// Convenience method for a pairing check for two pairs.
  function pairingProd2(
    G1Point memory a1,
    G2Point memory a2,
    G1Point memory b1,
    G2Point memory b2
  ) internal view returns (bool) {
    G1Point[] memory p1 = new G1Point[](2);
    G2Point[] memory p2 = new G2Point[](2);
    p1[0] = a1;
    p1[1] = b1;
    p2[0] = a2;
    p2[1] = b2;
    return pairing(p1, p2);
  }

  /// Convenience method for a pairing check for three pairs.
  function pairingProd3(
    G1Point memory a1,
    G2Point memory a2,
    G1Point memory b1,
    G2Point memory b2,
    G1Point memory c1,
    G2Point memory c2
  ) internal view returns (bool) {
    G1Point[] memory p1 = new G1Point[](3);
    G2Point[] memory p2 = new G2Point[](3);
    p1[0] = a1;
    p1[1] = b1;
    p1[2] = c1;
    p2[0] = a2;
    p2[1] = b2;
    p2[2] = c2;
    return pairing(p1, p2);
  }

  /// Convenience method for a pairing check for four pairs.
  function pairingProd4(
    G1Point memory a1,
    G2Point memory a2,
    G1Point memory b1,
    G2Point memory b2,
    G1Point memory c1,
    G2Point memory c2,
    G1Point memory d1,
    G2Point memory d2
  ) internal view returns (bool) {
    G1Point[] memory p1 = new G1Point[](4);
    G2Point[] memory p2 = new G2Point[](4);
    p1[0] = a1;
    p1[1] = b1;
    p1[2] = c1;
    p1[3] = d1;
    p2[0] = a2;
    p2[1] = b2;
    p2[2] = c2;
    p2[3] = d2;
    return pairing(p1, p2);
  }
}

contract Verifier {
  using Pairing for *;
  struct VerifyingKey {
    Pairing.G1Point alpha;
    Pairing.G2Point beta;
    Pairing.G2Point gamma;
    Pairing.G2Point delta;
    Pairing.G1Point[] gamma_abc;
  }
  struct Proof {
    Pairing.G1Point a;
    Pairing.G2Point b;
    Pairing.G1Point c;
  }

  function verifyingKey() internal pure returns (VerifyingKey memory vk) {
    vk.alpha = Pairing.G1Point(
      uint256(
        0x0235ddef31640f52b9683e23a561ef06ef985cb340b18ae809a04b495ba1bf9d
      ),
      uint256(
        0x1d17573297ce7872761cd68517c2d889b63c9135df42deb9e88572f3962d8632
      )
    );
    vk.beta = Pairing.G2Point(
      [
        uint256(
          0x07863b5a2a7f4af69d66ef9e9f839f52d743e37d9646dc3b8c7992202f3885e3
        ),
        uint256(
          0x02354a912d7c1104a518a6a9712867aab2ebba20de7b49118cc30b004408c683
        )
      ],
      [
        uint256(
          0x2e255a5843f0945bd803080ab0e2b6d039de6100cecd4c0a99c548b843681f31
        ),
        uint256(
          0x03cf60fe2615db8d2ce3f4bfde0a0911f422ceec54d09f56c4e0712475f6f82d
        )
      ]
    );
    vk.gamma = Pairing.G2Point(
      [
        uint256(
          0x0ed19183b2992d754953243f117e0946eb726e74a447f70b96596bb145d6b173
        ),
        uint256(
          0x070c28e275929b6a396b39b9a6f068a5fee9cfbd0e8ba27410b81c274012e622
        )
      ],
      [
        uint256(
          0x203202e958b6352fd9b5c055702157556b31252bb30b82d30d470b27aa4f3c83
        ),
        uint256(
          0x133812bb1703306df4c221389fcb0e009217c7f33e41aea449d5627e0a2da603
        )
      ]
    );
    vk.delta = Pairing.G2Point(
      [
        uint256(
          0x261ebbe9b05d627eb52bd331ac3bfaec72ba93fbda9d567ea0d84fd0cb13fcf7
        ),
        uint256(
          0x10b5e14869634ce23dfffd0b00c0a54096b0ea1ed7e84be2dcddd51b0ab1fb9b
        )
      ],
      [
        uint256(
          0x21342f17a1f3c999c820b68775998bec1bd0dcdc161e8f7c122b4109ad31db5e
        ),
        uint256(
          0x2ae8e24e6133f6841b1f707d3d8f2b62cf906db5419f8759cdc279e4dcb5fe7c
        )
      ]
    );
    vk.gamma_abc = new Pairing.G1Point[](1);
    vk.gamma_abc[0] = Pairing.G1Point(
      uint256(
        0x0a92c8bc84f131e3d8794fba30a0bea3b739ed2fa988bb965e8bd4161c62c955
      ),
      uint256(
        0x011ec9d1e55e77f7824cacc5cfd246943bbca809958f76d8a97103b79ad9c8a0
      )
    );
  }

  function verify(uint256[] memory input, Proof memory proof)
    internal
    view
    returns (uint256)
  {
    uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    VerifyingKey memory vk = verifyingKey();
    require(input.length + 1 == vk.gamma_abc.length);
    // Compute the linear combination vk_x
    Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
    for (uint256 i = 0; i < input.length; i++) {
      require(input[i] < snark_scalar_field);
      vk_x = Pairing.addition(
        vk_x,
        Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i])
      );
    }
    vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
    if (
      !Pairing.pairingProd4(
        proof.a,
        proof.b,
        Pairing.negate(vk_x),
        vk.gamma,
        Pairing.negate(proof.c),
        vk.delta,
        Pairing.negate(vk.alpha),
        vk.beta
      )
    ) return 1;
    return 0;
  }

  function verifyTx(Proof memory proof) public view returns (bool r) {
    uint256[] memory inputValues = new uint256[](0);

    if (verify(inputValues, proof) == 0) {
      return true;
    } else {
      return false;
    }
  }
}
