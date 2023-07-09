// function deployFunc(hre) {
//     console.log("Hi!")
//      hre.getNamedAccounts();
//      hre.deployements;
// }

const { deployments, getNamedAccounts } = require("hardhat")

// module.exports.default = deployFunc

// module.exports = async (hre) => {
// const {getNamedAccounts, deployments} = hre

// if the contract does not exist, we deploy a minimal version for our local testing

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
// const { helperConfig } = require("../helper-hardhat-config") // the same as previous row
// const networkConfig = helperConfig.networkConfig

const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("--------------------------------------")
}

module.exports.tags = ["all", "fundme"]
