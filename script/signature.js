const ethers = require("ethers");

const YOUR_CHAIN_ID = 84532;
const YOUR_CONTRACT_ADDRESS = "0x14B4ff9964dbb803967Ffd2D24819EA5a8496476";

const L2Resolver = {
  name: "L2Resolver",
  version: "1",
  chainId: YOUR_CHAIN_ID,
  verifyingContract: YOUR_CONTRACT_ADDRESS,
};

function getFullSignature(signature) {
  const { r, s, yParity } = signature;

  // Calculate v (27 or 28 for Ethereum)
  const v = 27 + yParity;

  // Concatenate r, s, and v to get the full signature
  const fullSignature = r + s.slice(2) + v.toString(16);
  return fullSignature;
}

async function getDomainSeparator() {
  const domainTypeHash = ethers.keccak256(
    ethers.toUtf8Bytes(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    )
  );

  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        domainTypeHash,
        ethers.keccak256(ethers.toUtf8Bytes(L2Resolver.name)),
        ethers.keccak256(ethers.toUtf8Bytes(L2Resolver.version)),
        L2Resolver.chainId,
        L2Resolver.verifyingContract,
      ]
    )
  );
}

async function addrHash(node, coinType, data, owner, expiry, signer) {
  const domainSeparator = await getDomainSeparator();
  const dataHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256", "bytes", "address", "uint256"],
      [node, coinType, data, owner, expiry]
    )
  );

  const toSign = ethers.keccak256(
    ethers.solidityPacked(
      ["string", "bytes32", "bytes32"],
      ["\x19\x01", domainSeparator, dataHash]
    )
  );

  console.log("To sign:", toSign);

  const signingKey = new ethers.SigningKey(signer.privateKey);
  const signature = signingKey.sign(ethers.getBytes(toSign));

  return signature;
}

// node scripts/signature.js
async function main() {
  // get parent namehash
  const node = ethers.getBytes(
    "0x0000000000000000000000000000000000000000000000000000000000001234"
  );
  const coinType = 60;

  const owner = "0x0376aac07ad725e01357b1725b5cec61ae10473c"; // this should be the authorised owner of the ENS
  const data = ethers.getBytes(owner);
  const expiry = 86401; // should be a resonable time in the future, recommend 60 seconds

  const provider = ethers.getDefaultProvider("mainnet"); // Use appropriate provider
  const signer = new ethers.Wallet(
    "b9107381136de811b8e393a31c99b02382db3d374502c3b0f80f094d343df8d3", // This is the CCIP test private key we are using
    provider
  ); 

  // this example is for getting address hash. Will need to be modified for text or contenthash
  const signature = await addrHash(node, coinType, data, owner, expiry, signer);



  const fullSignature = getFullSignature(signature);
  console.log("Full Signature:", fullSignature);
}

main();
