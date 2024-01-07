// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@ens/resolvers/Resolver.sol";
import "@ens/resolvers/profiles/ITextResolver.sol";
import "@ens/resolvers/profiles/IContentHashResolver.sol";
import "@ens/resolvers/profiles/IAddrResolver.sol";
import "@ens/resolvers/profiles/IAddressResolver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract L2Resolver is
    ITextResolver,
    IContentHashResolver,
    IAddrResolver,
    IAddressResolver,
    Ownable
{
    mapping(address => bool) public isSigner;
    mapping(bytes32 => bytes) public contenthash;
    mapping(bytes32 => mapping(string => string)) public text;
    uint256 public constant TTL = 300; // 5 minutes

    error Unauthorised();
    error InvalidSignature();
    error ExpiredSignature();

    constructor(address[] memory _signers) Ownable(msg.sender) {
        for (uint i = 0; i < _signers.length; i++) {
            isSigner[_signers[i]] = true;
        }
    }

    function setAddr(
        bytes32 _node,
        uint256 _coinType,
        bytes calldata _data,
        uint256 _expiry,
        address _owner,
        bytes calldata _gatewaySig
    ) external {}

    function setContenthash(
        bytes32 _node,
        bytes calldata _contenthash,
        uint256 _expiry,
        address _owner,
        bytes calldata _gatewaySig
    ) external {}

    function setText(
        bytes32 _node,
        string calldata _key,
        string calldata _value,
        uint256 _expiry,
        address _owner,
        bytes calldata _gatewaySig
    ) external {}

    function multicall(
        bytes[] calldata data
    ) external returns (bytes[] memory results) {}

    function multicallWithNodeCheck(
        bytes32 nodehash,
        bytes[] calldata data
    ) external returns (bytes[] memory results) {}

    function addr(
        bytes32 node,
        uint256 coinType
    ) external view returns (bytes memory) {}

    function addr(bytes32 node) external view returns (address payable) {}

    function contenthashHash(
        bytes32 node,
        bytes calldata _data,
        address _owner,
        uint256 _expiry
    ) public view returns (bytes32) {
        // Create the hash using EIP-712 standard
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    getDomainSeparator(),
                    keccak256(abi.encode(node, _data, _owner, _expiry))
                )
            );
    }

    function textHash(
        bytes32 node,
        string calldata _key,
        string calldata _value,
        address _owner,
        uint256 _expiry
    ) public view returns (bytes32) {
        // Create the hash using EIP-712 standard
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    getDomainSeparator(),
                    keccak256(
                        abi.encode(
                            node,
                            keccak256(abi.encodePacked(_key)),
                            keccak256(abi.encodePacked(_value)),
                            _owner,
                            _expiry
                        )
                    )
                )
            );
    }

    function addrHash(
        bytes32 node,
        uint256 coinType,
        bytes calldata _data,
        address _owner,
        uint256 _expiry
    ) public view returns (bytes32) {
        // Create the hash using EIP-712 standard
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    getDomainSeparator(),
                    keccak256(
                        abi.encode(node, coinType, _data, _owner, _expiry)
                    )
                )
            );
    }

    /// @notice Generates the EIP-712 domain separator
    /// @return EIP-712 domain separator
    function getDomainSeparator() public view returns (bytes32) {
        // EIP-712 domain type hash
        bytes32 domainTypeHash = keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

        // Values for the domain
        string memory name = "L2Resolver";
        string memory version = "1";
        uint256 chainId = block.chainid;
        address verifyingContract = address(this);

        // Generate the domain separator
        return
            keccak256(
                abi.encode(
                    domainTypeHash,
                    keccak256(bytes(name)),
                    keccak256(bytes(version)),
                    chainId,
                    verifyingContract
                )
            );
    }
}
