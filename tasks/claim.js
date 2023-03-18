const { task } = require("hardhat/config");
require("dotenv").config()
const { BigNumber } = require("ethers");
const distributor = require("./distributor")

task("claim", "", async (taskArgs, hre) => {
    const {PRIVATE_KEYS, PROVIDER} = process.env

    const provider = new hre.ethers.providers.JsonRpcProvider(PROVIDER || "https://arb1.arbitrum.io/rpc")
    const decimals = BigNumber.from(10).pow(18);

    let total = BigNumber.from(0)
    for (let key of PRIVATE_KEYS.split(",")) {
        const signer = new hre.ethers.Wallet(key, provider)
        const dis = new ethers.Contract(distributor.address, distributor.abi, signer)
        const claimable = (await dis.claimableTokens(signer.address)).div(decimals)
        let tx = await dis.claim()
        await tx.wait()
        console.log(`claim ${claimable} $ARB for ${signer.address}`)
        total = total.add(claimable)
    }
    console.log(`Claimed total ${total} $ARB`)
})
