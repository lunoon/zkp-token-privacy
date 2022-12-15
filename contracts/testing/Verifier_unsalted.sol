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
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
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
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
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
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
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
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x0632c1d538dc72ddcd4a415a9bbdf20b5a1de4c7040d9eccb3a7d04d1213b0eb), uint256(0x1988a5a087028267f710ab28c48a4290bfcdc728dbc45ca2438f5ab05ec4e901));
        vk.beta = Pairing.G2Point([uint256(0x11665b3fd7f0085a2f0ea57e1a854fa588d6b5716ef4c26105f3c718a7857b9e), uint256(0x0a8868b893e9f06ba22795ecc55702e6200e7cc0c918d15b9e593357988792d6)], [uint256(0x120b46f8c9ab9670d45d52fd4092e2ee64ccdee531aef747ea5f2b96e3a8a389), uint256(0x02a05ee0e85f1f260487332d359a226e1d830ffaa2ba827dcc13ef6a8deff021)]);
        vk.gamma = Pairing.G2Point([uint256(0x1956b65d25e4ca00214bb1e15673d861249c73236d29180778b352e811fc2bad), uint256(0x2d11645bcc45f3922b6a9a6186abd4079ffa848593662d20672eaaa39a484919)], [uint256(0x2728e6fdb0402fad8a47120553eb03143b3c65fe9fb4ee95c7fb43ba7f26b934), uint256(0x188cbf7bafe38c0eb4322878ff3bc0789cdb64ec7152cb9d91ab9b6de0898094)]);
        vk.delta = Pairing.G2Point([uint256(0x0f26fd9bd8456a5c0f6687dce3d81b3a55a50ec762e8bd471744dfe0c1796278), uint256(0x0da3604d7819c689e661bf5aa8cd15b8157ff02ea609ea270eba170106c7fb12)], [uint256(0x1d84a347fe87bd9e8e340499c5d39640ba6d290fd7ba2a4918dda0056919e0a8), uint256(0x0799174b82d7da4339a796231782d1ba9562ae852adcc5771714f66e3fa9cf51)]);
        vk.gamma_abc = new Pairing.G1Point[](7);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x11de65084018c391951ee6a855688350c7c9a79d0f795c028a18f13dfda4d8dc), uint256(0x12f3073325696c3afb5dc6b7bc2ba14dc77965c390ad75cd0b4efd199fcae3b0));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x05a2e52773cd63776f3ab39fefe1383b21291ab336b4a2bf6fb60cb0be6cda54), uint256(0x1f9ce48073c6b1ef18d16da37b7c872b61ec5693c732650d3ac0c41316b95b7e));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x020b1f7557caca2cdfc6edd6f29ef6bdca623f590f1193548c5ea981a4c5d5db), uint256(0x1bbfd7d41b78e00db4be9acf2249368302f3685f8cb2db0a6ed7a596af1d2afe));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x10bf2111592d513ecd5cb9be138597aabf1f77c370b191cbbc2844f0fb2f5e69), uint256(0x108c4d23506f4c7d60f8bb36345a139b567f46c46a727e772e66ff8587fd06f0));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x0d7ad9da6b84bb27c9a5be8d0eb76b9a89819d9597c609ab0b7c4f690f58a4d3), uint256(0x0efc380e40eb5c6b78606b368225fe89a436e62982c45eb17c251d50b2af6b86));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x235077c070eba827c9142f57663508adf59645ce3b718a6d69242c8870d4dfef), uint256(0x12494ab0dc0d21082e1278b5176c5f7eb4f203dd2d5c69d0184772dd9b6622e6));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x04d204c61948031eeea255cad0b294ae01e6502b020b9164a8f502584417b695), uint256(0x094cd79634f4c141f2b188f6eda1fae83a7581ef2566e287791336ef410245f3));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[6] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](6);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
