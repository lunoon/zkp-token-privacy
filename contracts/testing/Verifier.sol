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
        vk.alpha = Pairing.G1Point(uint256(0x19f71f93538a715ebd67e0d9b50b905d441830eb5f2b4b8041994d2d4d4610ec), uint256(0x0033abddc1db7bab91da89be7af00bb7f5fb4ec25a514cd92fbc23fcac9d9cfc));
        vk.beta = Pairing.G2Point([uint256(0x17fd7c073709cb5789c8ea6d5cb5583020b230b991315c036cb6cfff880bc975), uint256(0x2f870d33c346462ed69aa7f5972074e452e6bdb73aed1bef10ddaf518afc4efb)], [uint256(0x057e640bb3124b498d2be242bfb954cec34e0ded313e56a8538bd505b48af8e2), uint256(0x00dd25294e5f6c7899606a22e3814b87e12502186765b53c30480c25f6d529c9)]);
        vk.gamma = Pairing.G2Point([uint256(0x2e4edfc810ba19dc13704840e4cad8082c76f33ba91e3a02011a6c217f6aeb09), uint256(0x218b2469f7ffca9a5d8816843b3254972298a1a492e03cbbd8a40e4988b1e780)], [uint256(0x3060d2e9bccde5ab70986ac7cda0c097cb3bdf52e23f5578e3e3f8621180e561), uint256(0x129e248626cd0790012424f655148fefbc0ca01914f54266e8f5f649c2eeeffa)]);
        vk.delta = Pairing.G2Point([uint256(0x24a401a697eaf90f4307525bea008a72bbb985b5251e67bb20ec8b8e8b51b55e), uint256(0x03baa5038ddee2cb67e081ea4a26f3944d0051f5f404037c5c1fc30998b9bac7)], [uint256(0x178a790477271b45cd5514bc13e01e92e29369f83721105ce01e697be027c3f3), uint256(0x2b59925da3b2151b7ed80c5fbac4338b628b4197b86bf08221730d7a45593318)]);
        vk.gamma_abc = new Pairing.G1Point[](7);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x072a2eafe892fb14f9a996996cf4da07c1d678edc83f760a645e7026b972d828), uint256(0x097a766b44d2cfbe67f507c8f9638b14fd50cdf5484d00fd669a2175551f81ca));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x245a382bbd9a448ed1d2663b935ae5b9927f286dd4bb0d824fcc075d7bc60f4c), uint256(0x05593a4ef5a99752430ea909ffaf2abed4f458a61511aa6a0dc5547135b7e5be));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x1853a9c2d252f1a1a2eb7aecef03b3ddf60a69f9cc1c01022147f5fbc628bb6e), uint256(0x04ef277124a504d156e6f419facb841b722c28b11aa728cda79b9cd78d13ecb3));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x21a56c241d9b71c837615ea20916e82a0b93e8a6f253a567843a14c95884a9d4), uint256(0x14961987c643b294d4f2727095dcd2034c63004f77115a71362a939253681f4b));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x10637ee4dddd0a420b3ef182ae8b50941466be44573cdfe755b97fc628ef65a9), uint256(0x10add4051af0836f1666fab05dca59962804e21530c6e7a061e10d371be123b6));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x0d7f98873f3b9963ecac26ea1e13459aa84fd702b294d33c04ffb9eddcfdf1c1), uint256(0x17c87778ed125a12dd10d30db2eab765757f13a66070a797dfc1e09c234d8221));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x0b04e7facaebcce1565deffd38f3e59994c4af889f6511dd5e7be3e7a6f2cf43), uint256(0x092d7fcc7f730fb36097d4ee5dd2728584edee6886bc67889044418c71c7c0c0));
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
