//import ethers.js

const { ethers } = require("hardhat")

async function main(){
    //create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("contract deploying")
    //deploy contract from factory
    const fundMe = await fundMeFactory.deploy(10)
    await fundMe.waitForDeployment()
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);
    
    //verify fundme
    if(hre.network.config.chainId == 11155111 && process.env.API_KEY){
        console.log("waiting for 5 confirmations")
        await fundMe.deploymentTransaction.wait(5)
        await verifyFundMe(fundMe.target,[10])
    }else{
        console.log("verification skipped..")
    }
    

}

async function verifyFundMe(fundMeAddr,args) {
    await hre.run("verify:verify",{
        address: fundMeAddr,
        constructorArguments:args,
    });
    
}
//执行主函数，并抓取错误
main().then().catch((error) => {
    console.error(error)
    process.exit(1)
})