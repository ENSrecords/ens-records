import { BrowserProvider,ethers } from 'ethers';
import { SiweMessage } from 'siwe';

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



async function signSetTextData(node, key, value, expiry, privateKey) {
    const domainSeparator = await getDomainSeparator();
  
    // Encode the data according to the ABI specification
    const dataHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "string", "string", "uint256"],
        [node, key, value, expiry]
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
  


// node scripts/signature.js
async function setTextfordomain() {
    // get parent namehash
    const node = ethers.getBytes(
      "0xc43de559dead466af67548b7504c8c48f3f338c27ce81a9bece0edf74c9bc7d4"
    );
      
    const valnodedom = '0xc43de559dead466af67548b7504c8c48f3f338c27ce81a9bece0edf74c9bc7d4' // Replace with your node value
    const valdomkey = 'email';
    const valdomvalue = 's.hidayath@gmail.com';
    const valdomexpiry = 1; //1733011200; // Replace with your desired expiry
    const contPrivateKey ='0xb9107381136de811b8e393a31c99b02382db3d374502c3b0f80f094d343df8d3';
    const owner = "0x8dA48e5846c06B558970ACd42EDc7Da8799481E4"; // this should be the authorised owner of the ENS
    const private_key = ethers.getBytes("0xb9107381136de811b8e393a31c99b02382db3d374502c3b0f80f094d343df8d3");

    // this example is for getting address hash. Will need to be modified for text or contenthash
    const signatureSetText = await signSetTextData(node, valdomkey, valdomvalue, valdomexpiry,private_key);

    const fullSignatureSetText = getFullSignature(signatureSetText);
    console.log("SetText Full Signature:", fullSignatureSetText);


      // Smart contract address
      const resolverNew = '0x14B4ff9964dbb803967Ffd2D24819EA5a8496476';

      // Smart contract ABI
      const abi = [
        {
          constant: false,
          inputs: [
            { name: '_node', type: 'bytes32' },
            { name: '_key', type: 'string' },
            { name: '_value', type: 'string' },
            { name: '_expiry', type: 'uint256' },
            { name: '_gatewaySig', type: 'bytes' },
          ],
          name: 'setText',
          outputs: [],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ];
      try {
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        // const signer = provider.getSigner();
  
      const contract = new ethers.Contract(resolverNew, abi, signer);
      const tx = await contract.setText(node, valdomkey, valdomvalue, valdomexpiry, fullSignatureSetText);
      console.log('Transaction Hash:', tx.hash);

      // Wait for the transaction to be mined
      await tx.wait();
      console.log('Transaction completed');
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

  const owner = "0x0376aac07ad725e01357b1725b5cec61ae10473c"; // this should be the authorised owner of the ENS
  const data = ethers.getBytes(owner);
  const expiry = 86401; // should be a resonable time in the future, recommend 60 seconds

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

connectWalletBtn.onclick = connectWallet;
siweBtn.onclick = signInWithEthereum;
infoBtn.onclick = getInformation;
domainopp.onclick = getDomainopp;
setTextbtn.onclick = setTextfordomain;


