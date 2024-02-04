import { BrowserProvider,ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import abi from './abi/L2Resolver.json';
const domain = window.location.host;
const origin = window.location.origin;
const provider = new BrowserProvider(window.ethereum);

const BACKEND_ADDR = "http://localhost:3000";
async function createSiweMessage(address, statement) {
    const res = await fetch(`${BACKEND_ADDR}/nonce`, {
        credentials: 'include',
    });
    const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: '1',
        nonce: await res.text()
    });
    return message.prepareMessage();
}

function connectWallet() {
    provider.send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));
}

async function signInWithEthereum() {
    const signer = await provider.getSigner();

    const message = await createSiweMessage(
        await signer.getAddress(),
        'Sign in with Ethereum to the app.'
    );
    const signature = await signer.signMessage(message);

    const res = await fetch(`${BACKEND_ADDR}/verify`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
        credentials: 'include'
    });
    console.log(await res.text());
}

async function getInformation() {
    const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
        credentials: 'include',
    });
    console.log(await res.text());
}


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

async function addrHash(node, coinType, data, owner, expiry) {
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

                                    // this is the ccip private key we are using for testing
  const private_key = ethers.getBytes("0xb9107381136de811b8e393a31c99b02382db3d374502c3b0f80f094d343df8d3");
  const signingKey = new ethers.SigningKey(private_key);
  const signature = signingKey.sign(ethers.getBytes(toSign));

  return signature;
}




async function textHash(node, key, val, owner, expiry) {
  const domainSeparator = await getDomainSeparator();
  const dataHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32", "bytes32", "address", "uint256"],
      [node, ethers.keccak256(ethers.toUtf8Bytes(key)), ethers.keccak256(ethers.toUtf8Bytes(val)), owner, expiry]
    )
  );

  const toSign = ethers.keccak256(
    ethers.solidityPacked(
      ["string", "bytes32", "bytes32"],
      ["\x19\x01", domainSeparator, dataHash]
    )
  );

  console.log("To sign:", toSign);

                                    // this is the ccip private key we are using for testing
  const private_key = ethers.getBytes("0xb9107381136de811b8e393a31c99b02382db3d374502c3b0f80f094d343df8d3");
  const signingKey = new ethers.SigningKey(private_key);
  const signature = signingKey.sign(ethers.getBytes(toSign));

  return signature;
}


async function signSetTextData(node, key, value, expiry, privateKey, owner) {
    const domainSeparator = await getDomainSeparator();

    // Encode the data according to the ABI specification
    const dataHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "string", "string", "address", "uint256"],
        [node, ethers.keccak256(ethers.toUtf8Bytes(key)), ethers.keccak256(ethers.toUtf8Bytes(value)), owner, expiry]
      )
    );
  
    // Prepare the hash to be signed
    const toSign = ethers.keccak256(
      ethers.solidityPacked(
        ["string", "bytes32", "bytes32"],
        ["\x19\x01", domainSeparator, dataHash]
      )
    );
  
    console.log("To sign:", toSign);
  
    // Use the provided private key for signing
    const signingKey = new ethers.SigningKey(ethers.getBytes(privateKey));
    const signature = signingKey.sign(ethers.getBytes(toSign));
  
    return signature;
  }

  async function setAddressforDomain() {

        // get parent namehash
    const node = ethers.getBytes(
      "0xc43de559dead466af67548b7504c8c48f3f338c27ce81a9bece0edf74c9bc7d4"
    );

    const owner = "0x91769843CEc84Adcf7A48DF9DBd9694A39f44b42";

    const expiry = 1733011200; // Replace with your desired expiry

    const data = ethers.getBytes(owner);

    const coinType = 60;

    const signature = await addrHash(node, coinType, data, owner, expiry);

    const fullSignature = getFullSignature(signature);


    try {
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(YOUR_CONTRACT_ADDRESS, abi, signer);

    const tx = await contract.setAddr(node, coinType, data, expiry, fullSignature);

    tx.wait();

    } catch (error) {
      console.error('Error:', error);
    }




  }
  


// node scripts/signature.js
async function setTextfordomain() {
          // get parent namehash
          const node = ethers.getBytes(
            "0xc43de559dead466af67548b7504c8c48f3f338c27ce81a9bece0edf74c9bc7d4"
          );
      
          const owner = "0x91769843CEc84Adcf7A48DF9DBd9694A39f44b42";
      
          const expiry = 1733011200; // Replace with your desired expiry
      
          const data = ethers.getBytes(owner);
      
          const coinType = 60;

          const key = "testkey";
          const val = "testval";      
          const signature = await textHash(node, key, val, owner, expiry);
      
          const fullSignature = getFullSignature(signature);

      
      
          try {
          const signer = await provider.getSigner();
      
          const contract = new ethers.Contract(YOUR_CONTRACT_ADDRESS, abi, signer);
      
          const tx = await contract.setText(node, key, val, expiry, fullSignature);
      
          tx.wait();
      
          } catch (error) {
            console.error('Error:', error);
          }
      
      

  }








// node scripts/signature.js






async function getDomainopp() {
  // get parent namehash
  const node = ethers.getBytes(
    "0x0000000000000000000000000000000000000000000000000000000000001234"
  );
  const coinType = 60;

  const owner = "0x91769843CEc84Adcf7A48DF9DBd9694A39f44b42"; // this should be the authorised owner of the ENS
  const data = ethers.getBytes(owner);
  const expiry = 1737737209; // should be a resonable time in the future, recommend 60 seconds

  // this example is for getting address hash. Will need to be modified for text or contenthash
  const signature = await addrHash(node, coinType, data, owner, expiry);







  const fullSignature = getFullSignature(signature);
  console.log("Full Signature:", fullSignature);
}

const connectWalletBtn = document.getElementById('connectWalletBtn');
const siweBtn = document.getElementById('siweBtn');
const infoBtn = document.getElementById('infoBtn');
const domainopp = document.getElementById('domainopp');
const setTextbtn = document.getElementById('setTextbtn');
const setAddrbtn = document.getElementById('setAddrbtn');


connectWalletBtn.onclick = connectWallet;
siweBtn.onclick = signInWithEthereum;
infoBtn.onclick = getInformation;
domainopp.onclick = getDomainopp;
setTextbtn.onclick = setTextfordomain;
setAddrbtn.onclick = setAddressforDomain;

