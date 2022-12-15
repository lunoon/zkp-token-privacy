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
                0x1bf0e7e8f99d2f0fda2497dc4f67191a12cd312d31508d36a048bccb23b8a25b
            ),
            uint256(
                0x25628cd56d0728e8de6e4cd566cd5e79eccb9be9bf5339ccd12ef3df75e5df75
            )
        );
        vk.beta = Pairing.G2Point(
            [
                uint256(
                    0x13b0db40d66c3447ac87d47a5beaa961b1dfe52466042695ecb3ae6ce6afc2d9
                ),
                uint256(
                    0x11e88e1ac6999deec93d0e6f7f4fe6a6f46f48a8ad1d913a1e7b4d879b914600
                )
            ],
            [
                uint256(
                    0x1c3b71240fede4ea4929d73d602779ca104ba7f54c175aa50ccbf92eba3f796f
                ),
                uint256(
                    0x217e9e25ea520fb0bb2da012f64ac5c0afb28e470e3d891e0f18ac22b81eb703
                )
            ]
        );
        vk.gamma = Pairing.G2Point(
            [
                uint256(
                    0x12d5352eb4a71cddb114149aafbe3667364d3c5cb93d92c8047dcab296013f67
                ),
                uint256(
                    0x23531c3abf99f05bd18eb0c1bd0578d2f2a551c8265e88f08b7cb868d2afe739
                )
            ],
            [
                uint256(
                    0x2db6ff775bf2e5ab2b2a5ff7881a17ebf4284293460139447923bfbda58a3fa5
                ),
                uint256(
                    0x1c6e3f027eb6571be1f6561eabebb20fb6aa79bc4be4874c25f41c7af1b17c32
                )
            ]
        );
        vk.delta = Pairing.G2Point(
            [
                uint256(
                    0x07c1602532cf44c5dbd9aaf3f83c1a2873f60f659dff40808b7ccc5630a0db20
                ),
                uint256(
                    0x0fa72a14a5f15f77065bd81ded7f089f00f112c0aee5d191bb1e20e380f96e13
                )
            ],
            [
                uint256(
                    0x189c31a6ab0f499eb35488e38fc079ef104a800abc1c86eabf6c81db9bc64886
                ),
                uint256(
                    0x0d523545c4c8055c979816f329212d8bb1c1179198d4be5955c4081a7d32d149
                )
            ]
        );
        vk.gamma_abc = new Pairing.G1Point[](7);
        vk.gamma_abc[0] = Pairing.G1Point(
            uint256(
                0x0a302198d6a1f30727cd899f58efa1d8c0a93427b5adf3a678231863eaa99fe1
            ),
            uint256(
                0x2dd1204c15bc344a86d9c32b1a3e86d95e6d3fa076b9c680f2e722ee765b508a
            )
        );
        vk.gamma_abc[1] = Pairing.G1Point(
            uint256(
                0x1532b51f847495c025309b3430b4231c75059584e51e4e9f93037d830c5b1758
            ),
            uint256(
                0x1f36461b94955e29404d02b9ac1ef143c6e5d5b988a2cd9e011abfdb4e49d1c0
            )
        );
        vk.gamma_abc[2] = Pairing.G1Point(
            uint256(
                0x302b7aa26123403b041d09d682c03987412c436f52143c353a9ced825cf20a2c
            ),
            uint256(
                0x08c9b076b01617ecdbfaee335b07d1e2727e0836947160a999c5aa7ec4c817dd
            )
        );
        vk.gamma_abc[3] = Pairing.G1Point(
            uint256(
                0x090ffbe154d11c9645bc24966efbbbe12dfe365b42847852c0e3d86c90fc3e95
            ),
            uint256(
                0x279e0808b5c78208d96bed8f5dba47fe8b8a055271ecb5009194b33dadc64948
            )
        );
        vk.gamma_abc[4] = Pairing.G1Point(
            uint256(
                0x1704eae16e060c4ef1b4c761c501f774730dd405f997722c6905802c21c0d37d
            ),
            uint256(
                0x1597559ddae650e76d8b9caaaebe5f550526b90a191453ad203fd47006eef53f
            )
        );
        vk.gamma_abc[5] = Pairing.G1Point(
            uint256(
                0x080382b3e7138492050b8664d28d0445147933d5081a58795c54f1da2182e829
            ),
            uint256(
                0x217b3c5cb89e1687790dedece3a3e01911faa69e2ed008def56f95b07d171866
            )
        );
        vk.gamma_abc[6] = Pairing.G1Point(
            uint256(
                0x1a142771acab7f38f70f4c1c3d6a4dcf25e8bf657acb137dd53456669ab74cf0
            ),
            uint256(
                0x0a02cdcd64c1bf7944ead23c9ece07d9f3eea42fb9c6345c139f2f615af201c2
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

    function verifyTx(Proof memory proof, uint256[6] memory input)
        public
        view
        returns (bool r)
    {
        uint256[] memory inputValues = new uint256[](6);

        for (uint256 i = 0; i < input.length; i++) {
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
