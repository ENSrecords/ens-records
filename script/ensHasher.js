const ethers = require("ethers");


// these should come from .env file.. ccip is private and should not be exposed
const BASE_CHAIN_ID = 84532;
const BASE_CONTRACT_ADDRESS = "0x14B4ff9964dbb803967Ffd2D24819EA5a8496476";
const CCIP_PRIVATE_KEY = "0xb9107381136de811b8e393a31c99b02382db3d374502c3b0f80f094d343df8d3";


class ENSHasher {
    constructor() {
        this.l2Resolver = {
            name: 'L2Resolver',
            version: '1',
            chainId: BASE_CHAIN_ID,
            verifyingContract: BASE_CONTRACT_ADDRESS,
        };
    }

    async _getFullSignature(signature) {
        const { r, s, yParity } = signature;
      
        // Calculate v (27 or 28 for Ethereum)
        const v = 27 + yParity;
      
        // Concatenate r, s, and v to get the full signature
        const fullSignature = r + s.slice(2) + v.toString(16);
        return fullSignature;
      }

    async getDomainSeparator() {
        const domainTypeHash = ethers.keccak256(
            ethers.toUtf8Bytes(
                'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
            )
        );

        return ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(
                ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
                [
                    domainTypeHash,
                    ethers.keccak256(ethers.toUtf8Bytes(this.l2Resolver.name)),
                    ethers.keccak256(ethers.toUtf8Bytes(this.l2Resolver.version)),
                    this.l2Resolver.chainId,
                    this.l2Resolver.verifyingContract,
                ]
            )
        );
    }


      

    async _hash(dataTypes, dataValues) {
        const domainSeparator = await this.getDomainSeparator();
        const dataHash = ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(dataTypes, dataValues)
        );

        const toSign = ethers.keccak256(
            ethers.solidityPacked(
                ['string', 'bytes32', 'bytes32'],
                ['\x19\x01', domainSeparator, dataHash]
            )
        );

        const private_key = ethers.getBytes(CCIP_PRIVATE_KEY);
        const signingKey = new ethers.SigningKey(private_key);
        const signature = signingKey.sign(ethers.getBytes(toSign));

        return this._getFullSignature(signature);
    }

    async getContentHash(node, chash, owner, expiry) {
        return this._hash(

            ['bytes32', 'bytes', 'address', 'uint256'],
            [node, chash, owner, expiry]
        );
    }

    async getTextRecordHash(node, key, val, owner, expiry) {
        return this._hash(

            ['bytes32', 'bytes32', 'bytes32', 'address', 'uint256'],
            [node, ethers.keccak256(ethers.toUtf8Bytes(key)), ethers.keccak256(ethers.toUtf8Bytes(val)), owner, expiry]
        );
    }

    async getAddressHash(node, coinType, data, owner, expiry) {
        return this._hash(

            ['bytes32', 'uint256', 'bytes', 'address', 'uint256'],
            [node, coinType, data, owner, expiry]
        );
    }
}

module.exports = ENSHasher;
