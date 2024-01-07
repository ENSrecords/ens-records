// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@ens/resolvers/Resolver.sol";
import "@ens/resolvers/profiles/ITextResolver.sol";
import "@ens/resolvers/profiles/IContentHashResolver.sol";
import "@ens/resolvers/profiles/IAddrResolver.sol";
import "@ens/resolvers/profiles/IAddressResolver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Multicall} from "@openzeppelin/contracts/utils/Multicall.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract L2Resolver is
    ITextResolver,
    IContentHashResolver,
    IAddrResolver,
    IAddressResolver,
    Ownable,
    Multicall
{
    address public gatewaySigner;
    mapping(bytes32 => bytes) public contenthash;
    mapping(bytes32 => mapping(string => string)) public text;
    mapping(bytes32 => mapping(uint256 => bytes)) public addr_;

    error InvalidSignature();
    error ExpiredSignature();

    constructor(address _signer) Ownable(msg.sender) {
        gatewaySigner = _signer;
    }

    function setGatewaySigner(address _signer) external onlyOwner {
        gatewaySigner = _signer;
    }

    function setAddr(
        bytes32 _node,
        uint256 _coinType,
        bytes calldata _data,
        uint256 _expiry,
        address _owner,
        bytes calldata _gatewaySig
    ) external {
        _checkExpiry(_expiry);
        bytes32 aHash = addrHash(_node, _coinType, _data, _owner, _expiry);
        bool result = SignatureChecker.isValidSignatureNow(
            gatewaySigner,
            aHash,
            _gatewaySig
        );

        if (!result) {
            revert InvalidSignature();
        }

        addr_[_node][_coinType] = _data;
    }

    function setContenthash(
        bytes32 _node,
        bytes calldata _contenthash,
        uint256 _expiry,
        address _owner,
        bytes calldata _gatewaySig
    ) external {
        _checkExpiry(_expiry);
        bytes32 chash = contenthashHash(_node, _contenthash, _owner, _expiry);
        bool result = SignatureChecker.isValidSignatureNow(
            gatewaySigner,
            chash,
            _gatewaySig
        );

        if (!result) {
            revert InvalidSignature();
        }

        contenthash[_node] = _contenthash;
    }

    function setText(
        bytes32 _node,
        string calldata _key,
        string calldata _value,
        uint256 _expiry,
        address _owner,
        bytes calldata _gatewaySig
    ) external {
        _checkExpiry(_expiry);
        bytes32 thash = textHash(_node, _key, _value, _owner, _expiry);
        bool result = SignatureChecker.isValidSignatureNow(
            gatewaySigner,
            thash,
            _gatewaySig
        );

        if (!result) {
            revert InvalidSignature();
        }

        text[_node][_key] = _value;
    }

    function addr(
        bytes32 node,
        uint256 coinType
    ) external view returns (bytes memory) {
        return addr_[node][coinType];
    }

    function addr(bytes32 node) external view returns (address payable) {
        address a;
        bytes memory data = addr_[node][60];

        assembly {
            a := data
        }
        return payable(a);
    }

    function _checkExpiry(uint256 _expiry) internal view {
        if (_expiry < block.timestamp) {
            revert ExpiredSignature();
        }
    }

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
