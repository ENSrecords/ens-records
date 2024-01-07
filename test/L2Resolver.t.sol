// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {L2Resolver} from "src/L2Resolver.sol";

contract L2ResolverTest is Test {
    L2Resolver resolver;
    uint256 internal signerPrivatekey = 0xA11CE;
    uint256 internal userPrivateKey = 0xB0B;
    address internal signer = vm.addr(signerPrivatekey);
    address internal user = vm.addr(userPrivateKey);

    function setUp() public {
        resolver = new L2Resolver(signer);
    }

    function testSetTextRecord() public {
        string memory key = "exampleKey";
        string memory value = "exampleValue";
        uint256 expiry = block.timestamp + 1 days;

        bytes32 node;

        assembly {
            node := 0x1234
        }

        bytes32 textHash = resolver.textHash(node, key, value, user, expiry);

        bytes memory gatewaySig;
        {
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(
                signerPrivatekey,
                textHash
            );

            gatewaySig = abi.encodePacked(r, s, v);
        }
        resolver.setText(node, key, value, expiry, user, gatewaySig);
        assertEq(resolver.text(node, key), value);
    }

    function testSetContentHashRecord() public {
        bytes32 node;
        assembly {
            node := 0x1234
        }
        bytes memory contentHashData = "exampleContentHash";
        uint256 expiry = block.timestamp + 1 days;

        // Hashing the content hash data
        bytes32 contentHash = resolver.contenthashHash(
            node,
            contentHashData,
            user,
            expiry
        );

        // Signing the hash
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            signerPrivatekey,
            contentHash
        );

        bytes memory gatewaySig = abi.encodePacked(r, s, v);

        // Setting the content hash record
        resolver.setContenthash(
            node,
            contentHashData,
            expiry,
            user,
            gatewaySig
        );

        // Asserting the content hash record was set correctly
        assertEq(resolver.contenthash(node), contentHashData);
    }

    function testSetAddrRecord() public {
        bytes32 node;
        assembly {
            node := 0x1234
        }
        uint256 coinType = 1; // Example coin type
        bytes memory addrData = abi.encodePacked(user); // Replace with actual address data if needed
        uint256 expiry = block.timestamp + 1 days;

        // Hashing the address data
        bytes32 addrHash = resolver.addrHash(
            node,
            coinType,
            addrData,
            user,
            expiry
        );

        // Signing the hash
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivatekey, addrHash);

        bytes memory gatewaySig = abi.encodePacked(r, s, v);

        // Setting the address record
        resolver.setAddr(node, coinType, addrData, expiry, user, gatewaySig);

        // Asserting the address record was set correctly
        assertEq(resolver.addr(node, coinType), addrData);
    }

    function testSetTextRecord_Expired() public {
        string memory key = "exampleKey";
        string memory value = "exampleValue";
        uint256 expiry = block.timestamp + 1 days;

        bytes32 node;

        assembly {
            node := 0x1234
        }

        bytes32 textHash = resolver.textHash(node, key, value, user, expiry);

        bytes memory gatewaySig;
        {
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(
                signerPrivatekey,
                textHash
            );

            gatewaySig = abi.encodePacked(r, s, v);
        }

        vm.warp(expiry + 1);

        vm.expectRevert(L2Resolver.ExpiredSignature.selector);
        resolver.setText(node, key, value, expiry, user, gatewaySig);
    }

    function testSetContentHashRecord_Expired() public {
        bytes32 node;
        assembly {
            node := 0x1234
        }
        bytes memory contentHashData = "exampleContentHash";
        uint256 expiry = block.timestamp + 1 days;

        // Hashing the content hash data
        bytes32 contentHash = resolver.contenthashHash(
            node,
            contentHashData,
            user,
            expiry
        );

        // Signing the hash
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            signerPrivatekey,
            contentHash
        );

        bytes memory gatewaySig = abi.encodePacked(r, s, v);

        vm.warp(expiry + 1); // Fast forward time to after the expiry

        vm.expectRevert(L2Resolver.ExpiredSignature.selector);
        resolver.setContenthash(
            node,
            contentHashData,
            expiry,
            user,
            gatewaySig
        );
    }

    function testSetAddrRecord_Expired() public {
        bytes32 node;
        assembly {
            node := 0x1234
        }
        uint256 coinType = 1; // Example coin type
        bytes memory addrData = abi.encodePacked(user);
        uint256 expiry = block.timestamp + 1 days;

        // Hashing the address data
        bytes32 addrHash = resolver.addrHash(
            node,
            coinType,
            addrData,
            user,
            expiry
        );

        // Signing the hash
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivatekey, addrHash);

        bytes memory gatewaySig = abi.encodePacked(r, s, v);

        vm.warp(expiry + 1); // Fast forward time to after the expiry

        vm.expectRevert(L2Resolver.ExpiredSignature.selector);
        resolver.setAddr(node, coinType, addrData, expiry, user, gatewaySig);
    }

    function testSetTextRecord_InvalidSignerSignature() public {
        string memory key = "exampleKey";
        string memory value = "exampleValue";
        uint256 expiry = block.timestamp + 1 days;

        bytes32 node;
        assembly {
            node := 0x1234
        }

        bytes32 textHash = resolver.textHash(node, key, value, user, expiry);

        bytes memory invalidSignerSig;
        
        {
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(
                0xDeadBeef, // Example invalid private key for signer
                textHash
            );
            invalidSignerSig = abi.encodePacked(r, s, v);
        }

        vm.expectRevert(L2Resolver.InvalidSignature.selector);
        resolver.setText(
            node,
            key,
            value,
            expiry,
            user,
            invalidSignerSig // Valid user signature
        );
    }

    function testSetContentHashRecord_InvalidSignerSignature() public {
        bytes32 node;
        assembly {
            node := 0x1234
        }
        bytes memory contentHashData = "exampleContentHash";
        uint256 expiry = block.timestamp + 1 days;

        bytes32 contentHash = resolver.contenthashHash(
            node,
            contentHashData,
            user,
            expiry
        );

        bytes memory invalidSignerSig;
        
        {
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(
                0xDeadBeef, // Example invalid private key for signer
                contentHash
            );
            invalidSignerSig = abi.encodePacked(r, s, v);
        }

        vm.expectRevert(L2Resolver.InvalidSignature.selector);
        resolver.setContenthash(
            node,
            contentHashData,
            expiry,
            user,
            invalidSignerSig // Valid user signature
        );
    }

    function testSetAddrRecord_InvalidSignerSignature() public {
        bytes32 node;
        assembly {
            node := 0x1234
        }
        uint256 coinType = 1; // Example coin type
        bytes memory addrData = abi.encodePacked(user);
        uint256 expiry = block.timestamp + 1 days;

        bytes32 addrHash = resolver.addrHash(
            node,
            coinType,
            addrData,
            user,
            expiry
        );

        bytes memory invalidSignerSig;
        
        {
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(
                0xDeadBeef, // Example invalid private key for signer
                addrHash
            );
            invalidSignerSig = abi.encodePacked(r, s, v);
        }

        vm.expectRevert(L2Resolver.InvalidSignature.selector);
        resolver.setAddr(
            node,
            coinType,
            addrData,
            expiry,
            user,
            invalidSignerSig
        );
    }

    function testSetTextRecordWithMulticall() public {
        string memory key = "exampleKey";
        string memory value = "exampleValue";
        string memory key2 = "exampleKey2";
        string memory value2 = "exampleValue2";
        uint256 expiry = block.timestamp + 1 days;

        bytes32 node;

        assembly {
            node := 0x1234
        }

        bytes memory gatewaySig;
        bytes memory gatewaySig2;
        {
            bytes32 textHash = resolver.textHash(
                node,
                key,
                value,
                user,
                expiry
            );
            bytes32 textHash2 = resolver.textHash(
                node,
                key2,
                value2,
                user,
                expiry
            );

            (uint8 v, bytes32 r, bytes32 s) = vm.sign(
                signerPrivatekey,
                textHash
            );
            (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(
                signerPrivatekey,
                textHash2
            );

            gatewaySig = abi.encodePacked(r, s, v);
            gatewaySig2 = abi.encodePacked(r2, s2, v2);
        }
        bytes memory data = abi.encodeWithSelector(
            L2Resolver.setText.selector,
            node,
            key,
            value,
            expiry,
            user,
            gatewaySig
        );
        bytes memory data2 = abi.encodeWithSelector(
            L2Resolver.setText.selector,
            node,
            key2,
            value2,
            expiry,
            user,
            gatewaySig2
        );
        bytes[] memory calls = new bytes[](2);
        calls[0] = data;
        calls[1] = data2;
        resolver.multicall(calls);
        assertEq(resolver.text(node, key), value);
        assertEq(resolver.text(node, key2), value2);
    }
}
