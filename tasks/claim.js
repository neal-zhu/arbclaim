const { task } = require("hardhat/config");
require("dotenv").config()
const { BigNumber } = require("ethers");
const distributor = require("./distributor")
const arb = require("./arb")

const {PRIVATE_KEYS, ARB_PROVIDER, ETH_PROVIDER} = process.env

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

task("claim", "", async (taskArgs, hre) => {
    const arbProvider = new hre.ethers.providers.JsonRpcProvider(ARB_PROVIDER)
    const ethProvider = new hre.ethers.providers.JsonRpcProvider(ETH_PROVIDER)
    const decimals = BigNumber.from(10).pow(18);
    const START_BLOCK = 16890400;

    let claim = async (key) => {
        const signer = new hre.ethers.Wallet(key, arbProvider)
        const dis = new ethers.Contract(distributor.address, distributor.abi, signer)
        let claimable = (await dis.claimableTokens(signer.address))
        let tx;
        if (claimable.isZero()) {
            console.log(`No claimable $ARB for ${signer.address}`)
        } else {
            tx = await dis.claim()
            await tx.wait()
            console.log(`claim ${claimable.div(decimals)} $ARB for ${signer.address}`)
        }
        if (taskArgs.receiver !== "") {
            const token = new ethers.Contract(arb.address, arb.abi, signer)
            tx = await token.transfer(taskArgs.receiver, claimable);
            await tx.wait();
            console.log(`transfer ${claimable.div(decimals)} $ARB to ${taskArgs.receiver} for ${signer.address}`)
        }
        return claimable.div(decimals)
    }

    while (true) {
        const current = await ethProvider.getBlockNumber()
        if (current < START_BLOCK) {
            console.log(`Curent height ${current} waiting for block ${START_BLOCK}...`)
            await sleep(3)
            continue;
        }
        console.log("Start claiming...")
        let total = BigNumber.from(0)
        let jobs = [];
        for (let key of PRIVATE_KEYS.split(",")) {
            jobs.push(claim(key))
        }
        let reulst = await Promise.all(jobs)
        for (let r of reulst) {
            total = total.add(r)
        }
        console.log(`Claimed total ${total} $ARB`)
        return;
    }
}).addParam("receiver", "", "")

task("approve", "", async (taskArgs, hre) => {
    const provider = new hre.ethers.providers.JsonRpcProvider(ARB_PROVIDER)

    for (let key of PRIVATE_KEYS.split(",")) {
        const signer = new hre.ethers.Wallet(key, provider)
        const dis = new ethers.Contract(distributor.address, distributor.abi, signer)
        const token = new ethers.Contract(arb.address, arb.abi, signer)
        const claimable = (await dis.claimableTokens(signer.address))
        let tx = await token.approve(taskArgs.spender, claimable);
        await tx.wait();
        console.log(`approve ${claimable} $ARB for ${signer.address}`)
    }
}).addParam("spender", "The address of the spender")
