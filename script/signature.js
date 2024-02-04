const ENSHasher = require("./ensHasher");
const ethers = require("ethers");

// ** Important **:
// The `owner` needs checking and confirming that they are the owner of the node before signing the hash
async function getContenthash() {
  const hasher = new ENSHasher();

  // Example test for getContentHash
  const node = ethers.keccak256(ethers.toUtf8Bytes("example.eth"));
  const chash = "0x123456"; // example content hash
  const owner = "0x91769843CEc84Adcf7A48DF9DBd9694A39f44b42"; // example owner address
  const expiry = Date.now() + 300; // example expiry timestamp

  try {
    const contentHashSignature = await hasher.getContentHash(
      node,
      chash,
      owner,
      expiry
    );
    console.log("Content Hash Signature:", contentHashSignature);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

async function getTextRecord() {
  const hasher = new ENSHasher();

  // Example test for getTextRecord
  const node = ethers.keccak256(ethers.toUtf8Bytes("example.eth"));
  const key = "testkey";
  const val = "testval";

  const owner = "0x91769843CEc84Adcf7A48DF9DBd9694A39f44b42"; // example owner address
  const expiry = Date.now() + 300; // example expiry timestamp

  try {
    const contentHashSignature = await hasher.getTextRecordHash(
      node,
      key,
      val,
      owner,
      expiry
    );
    console.log("Text record Signature:", contentHashSignature);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

async function getAddress() {
  const hasher = new ENSHasher();

  // Example test for getAddress
  const node = ethers.keccak256(ethers.toUtf8Bytes("example.eth"));
  const addr = ethers.getBytes("0x91769843CEc84Adcf7A48DF9DBd9694A39f44b42");
  const owner = "0x91769843CEc84Adcf7A48DF9DBd9694A39f44b42"; // example owner address
  const coinType = 60; // example coin type
  const expiry = Date.now() + 300; // example expiry timestamp

  try {
    const contentHashSignature = await hasher.getAddressHash(
      node,
      coinType,
      addr,
      owner,
      expiry
    );
    console.log("Address record Signature:", contentHashSignature);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

getContenthash();
getAddress();
getTextRecord();
