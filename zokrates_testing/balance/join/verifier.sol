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
        vk.alpha = Pairing.G1Point(uint256(0x088dbce96893282766baa50881525ca36ceaaf77ec7eecba02b9246368646eb6), uint256(0x2bd6c8086b4941ff9b3e475d6367e95f82dd1db21eee06611b7182137c3f1b36));
        vk.beta = Pairing.G2Point([uint256(0x0577098242b6c72cf3f2192c59c96b3b635224a594bf7b53f1a6224050aeb9c6), uint256(0x23e78ad85f65ca0b949ecfaab531c0e34bced2e9436cebf1b0092238f596ec9f)], [uint256(0x1f7ee6a74cdd3d779d5bb6bd724d9140d66584679ac76a18d4834163267ed4b8), uint256(0x085afce2e9bfad57725bd642cc59951e52f5cb5c4dbd8d5e4adebe166ddee3fa)]);
        vk.gamma = Pairing.G2Point([uint256(0x304c13a2edb7f64f4dd89d5320706a618050aeed04a8b6313e9d5463a56d75fa), uint256(0x1df3fcd71d44c31f0463fe195f51b5d8ead0ca1e9a7ec85f78e2a6e380949df2)], [uint256(0x1a75a51bf0b7788852b4e9462fa12b08638b5dfdca6bba3df95cbac6f58ffcaf), uint256(0x08c7070092468ac682c0dc9ec3b4ff452e50b89c7816a0aaedf03230bdb46e98)]);
        vk.delta = Pairing.G2Point([uint256(0x1a10efc8c4958574eefefe3a4b2c86eb8756a89ff9dfa58eaf29bb1710ab1929), uint256(0x0d898d0e9ee839d78866aa34b92b29bbd0d1547ce4a57a1d68d7774ca1439809)], [uint256(0x1391c0b11b315c51c5852e63a6845df45e338c7eed4d4a5f56012328d1575d7d), uint256(0x1cb467ff44aa37ab09abafbf21a26fd2f2799869147577180416031fdfda1857)]);
        vk.gamma_abc = new Pairing.G1Point[](7);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x2a297b01d83e6c271ccb66f2be7d3463f095ade434d538a97ee50119c121e8b2), uint256(0x0c4a63376e0424b5079c27364b3bd17467e574431a96f21729e4f4e416d94511));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x025542dc6e8c82c1b0ba47b08e7d572293d1d7c5bcdccfa2c15d49f2d0464136), uint256(0x1c28402e2e07bb14c277e5f1757f99304046e0f6c46dede5928453b46e41fa57));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x1c464cd1e1aace495fd7eac6472390e1f54cc252e13c558642f87f6238b0c96e), uint256(0x147ddb08d6309f2cbf549492da0aae9238f19d07618fdf5a7c447bf75cb12ab6));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x22ed163468fa08c2af4e6cff91a25a2b873b99a3853ba30a0b8eef99f9f0c9b5), uint256(0x19109de89db3e66dd28ecf8d11734ba450c25c19f3d9dc7481b278837b6eb15f));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x218c25b412dda302340218f038e0863fb4f0c8045c206f595e63a29c594b4aae), uint256(0x05ea56f32327b0c8655cd1359013bb80f93436eaa9147f832d60c819e5100cfd));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x1f8e15f3ac0cf51cb3645093ff55642c600ea051cb6b5eea59421252414d3b79), uint256(0x107b3149263c71bcc343f5e08c864e830d71a64959ac1b9e759bc2595b1c97a8));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x2565f0ea502d7d3221bb83e8be53c243fccee51592c259e781ea25f8dc2b2ba1), uint256(0x0f79dc3bd9952cfcaa0d076f7bbdc7118bee3805897a2330fba541b97a003431));
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
