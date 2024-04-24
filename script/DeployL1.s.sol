// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {L2Resolver} from "src/L1Resolver.sol";


// forge script script/DeployL1.s.sol:DeployScript --private-key $PRIVATE_KEY --rpc-url $L2_RPC --broadcast -vv
contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        console2.log(msg.sender);
        address gatewayAddress = 0x25F7308988aD82504336F397E083eDea89C229c6;

        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        L2Resolver resolver = new L2Resolver(gatewayAddress);



    }
}
