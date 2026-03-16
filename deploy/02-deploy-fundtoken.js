//const { network } = require("hardhat")

module.exports = async({getNamedAccounts,deployments}) =>{

    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments
    const fundMeAddr = (await deployments.get("FundMe")).address
    console.log("Deploying FundTokenERC20 contract")
    await deploy("FundTokenERC20",{
        contract: "FundTokenERC20",
        from: firstAccount,
        log: true,
        args:[fundMeAddr]
    })

    console.log("FundTokenERC20 contract deployed successfully")

}

module.exports.tags = ["all","fundtoken"]




