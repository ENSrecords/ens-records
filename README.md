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