const hre = require("hardhat");

const WALLET_ADDRESS = "0xb62a09665BA1Df3435ab343e0C3c3ab385C451ad"
const CONTRACT_ADDRESS = "0x55028C6025c395AC1854182B627ca8010f8Cf54F"

async function main(_URI) {
    const NFT = await hre.ethers.getContractFactory("MyToken");

    const contract = NFT.attach(CONTRACT_ADDRESS);
    await contract.safeMint(WALLET_ADDRESS, "https://google.com").then((txn) => {
        // Log Txn
        console.log(txn.hash)
        return(txn)
    }).catch(error => {
        console.error(error);
        process.exit(1);
    });
}

await main("")
console.log("done!")