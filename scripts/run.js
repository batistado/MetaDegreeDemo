//import { NFTStorage, File } from 'nft.storage'
//import { pack } from 'ipfs-car/pack';
const hre = require('hardhat');
const fs = require('fs');
const nft = require('nft.storage');
const lfp = require('get-file-object-from-local-path');
const { 
    v4: uuidv4,
  } = require('uuid');
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-west-1'});
const credentials = new AWS.SharedIniFileCredentials({profile: 'wasabi'});
AWS.config.credentials = credentials;
AWS.config.credentials.accessKeyId = "D7DX36BFRE2TV2M7D4W8"
AWS.config.credentials.secretAccessKey = "EjZysW61zzgsWTELSDHzigwoHG6ShnJzMk8RMfY3"

// Set an endpoint.
const ep = new AWS.Endpoint('s3.wasabisys.com');

// Create an S3 client
const s3 = new AWS.S3({endpoint: ep});
//import { LocalFileData, constructFileFromLocalFileData } from 'get-file-object-from-local-path'

async function deployContract() {
    const NFT = await hre.ethers.getContractFactory("MyToken");
    console.log("got contract")
    const nft = await NFT.deploy();
    console.log("awaiting deployment confirmation")
    await nft.deployed();
    console.log("contract deployed to:", nft.address);
    return nft.address;
}

const NFT_ENDPOINT = 'https://api.nft.storage'
const WALLET_ADDRESS = "0xb62a09665BA1Df3435ab343e0C3c3ab385C451ad"
const NFT_STORAGE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU1MTYyQjRkMTA3MTI4MTIwM2YwQzZENTAwNzkxRTQ5RUJCNjY4MjQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MDg0MjI4OTAyMSwibmFtZSI6Ik1ldGFEZWdyZWUifQ.6k3dKNXg8Pej5vHVC4_6h793zLPqzlEP6II-jzo-0aE"

const client = new nft.NFTStorage({ endpoint: NFT_ENDPOINT,
    token: NFT_STORAGE_KEY })

async function mintToken(uri, contractAddress) {
    const NFT = await hre.ethers.getContractFactory("MyToken");

    console.log("before nft attach")
    const contract = NFT.attach(contractAddress);
    console.log("after nft attach")
    return await contract.safeMint(WALLET_ADDRESS, uri).then((txn) => {
        console.log("Minting Txn hash: ", txn.hash)
        return txn.hash;
    });
}

async function retrieveTokenURI(uri, contractAddress) {
    const NFT = await hre.ethers.getContractFactory("MyToken");

    const contract = NFT.attach(contractAddress);
    return await contract.tokenURI(uri).then((data) => {
        console.log("IPFS URI: ", data)
        return data;
    });
}

const putObjectWrapper = (params) => {
    return new Promise((resolve, reject) => {
      s3.putObject(params, function (err, result) {
        if(err) reject(err);
        if(result) resolve(result);
      });
    })
  }

async function uploadFileToNFT(name, description, filePath) {
    //const fileData = new lfp.LocalFileData(filePath)
    const data = await fs.promises.readFile(filePath)

    const object_upload_params = {
        Bucket: "trialdemodegree",
        Key: name,
        Body: data,
    };
    
    const res = await putObjectWrapper(object_upload_params);
    // upload object to previously created "examplebucket"
    //const res = s3.putObject(object_upload_params).promise();
    console.log("put obj ", res);
    return res.Location;
    // console.log("hello")
    // return s3.upload({
    //     Bucket: 'trialdemodegree',
    //     Body: data,
    //     Key:name,
    // }, function (err, data) {
    //     if (err) {
    //       throw err
    //     } if (data) {
    //       console.log("Upload Success", data.Location);
    //       return data.Location
    //     }
    //   })
}

async function main(path) {
    const contractAddress = await deployContract();
    //const contractAddress = "";
    const fileName = uuidv4();
    const uri = await uploadFileToNFT(fileName, "test desc", path)
    console.log("Uploaded file")
    const txnHash = await mintToken("0x3A48D064a1e4E88E941a3540DA742086657d05a0", contractAddress);
    console.log("done: ", txnHash)
    const ipfsURL = await retrieveTokenURI(0, contractAddress);
    console.log("IPFS URL: ", ipfsURL)
}

main("/Users/mksyed/Desktop/Desk.pdf").then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});