# L2Resolver Contract and Tests

## Overview
The `L2Resolver` contract is a Solidity implementation intended for use with the Ethereum Name Service (ENS) on Layer 2 networks. This contract facilitates cost-effective updates of ENS records, including `contenthash`, `address`, and `text` records. A key feature of this contract is the utilization of a trusted gateway signer, responsible for verifying the ownership of ENS domains on Layer 1 before any record updates on Layer 2. This approach ensures security and integrity while leveraging the efficiency of Layer 2 operations.

## Contract Features
- **Flexible Record Management**: Efficiently update `contenthash`, `address`, and `text` records for ENS domains.
- **Layer 1 Ownership Verification**: Integrates with a trusted gateway to verify ENS domain ownership on Layer 1.
- **Signature-Based Security**: Employs EIP-712 standard for secure and verifiable signing of transactions.
- **Ownership and Access Control**: Utilizes OpenZeppelin's `Ownable` contract for managing access and permissions.
- **Batch Operations**: Supports `Multicall` from OpenZeppelin, enabling batched transactions for improved efficiency.

## Test Suite
The accompanying test suite demonstrates the functionality and robustness of the `L2Resolver` contract. Key aspects include:

- **Functional Testing**: Tests cover all functionalities like setting text, content hash, and address records.
- **Security Assurance**: Includes tests for signature validation, ensuring that only correctly signed data from the trusted gateway is processed.
- **Edge Cases and Reverts**: Tests for expiry and invalid signatures, ensuring the contract behaves as expected in erroneous or malicious scenarios.
- **Efficiency Testing**: Demonstrates the use of multicall for batch operations, showcasing the efficiency of the contract.

## Usage
The `L2Resolver` contract can be deployed on any Ethereum Layer 2 network. The contract requires a trusted gateway signer address at the time of deployment. Once deployed, the contract can be interacted with using standard Ethereum transaction calls, with the added requirement of EIP-712 compliant signatures from the trusted gateway for record updates.

### Key Functions
- `setText`, `setContenthash`, `setAddr`: Update text, content hash, and address records respectively.
- `addr`, `contenthash`, `text`: View functions to retrieve stored records.
- `multicall`: Execute multiple transactions in a single call.

## Development and Testing
To contribute to the development or run the test suite:

1. Clone the repository.
2. Install Foundry if not already installed
3. Run tests using the command `forge test`.


## Contract
Test contract is deployed on sepolia base
https://base-sepolia.blockscout.com/address/0x14B4ff9964dbb803967Ffd2D24819EA5a8496476

private key for api = `0xb9107381136de811b8e393a31c99b02382db3d374502c3b0f80f094d343df8d3`
public address for api = `0x25F7308988aD82504336F397E083eDea89C229c6`

## Contract Details

should use one of these three functions to set the data

```Javascript
    function setText(
        bytes32 _node,
        string calldata _key,
        string calldata _value,
        uint256 _expiry,
        bytes calldata _gatewaySig
    ) 
    function setContenthash(
        bytes32 _node,
        bytes calldata _contenthash,
        uint256 _expiry,
        bytes calldata _gatewaySig
    )
    function setAddr(
        bytes32 _node,
        uint256 _coinType,
        bytes calldata _data,
        uint256 _expiry,
        bytes calldata _gatewaySig
    )
```
The `_gatewaySig` data should be eip-712 signature of the correct object and signed by the gateway key.

Use this function to get the domain separator for the signature.

```Javascript
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
```

These functions can be used for testing, but the signature should be constructed offchain.

```Javascript
    function addrHash(
        bytes32 node,
        uint256 coinType,
        bytes calldata _data,
        address _owner,
        uint256 _expiry
    )

    function textHash(
        bytes32 node,
        string calldata _key,
        string calldata _value,
        address _owner,
        uint256 _expiry
    )

    function contenthashHash(
        bytes32 node,
        bytes calldata _data,
        address _owner,
        uint256 _expiry
    )
```

Multicall can also be used to batch transactions. Each transaction should include the signed data from the gateway.
    
```Javascript
    function multicall(bytes[] calldata data) external returns (bytes[] memory results)
```
