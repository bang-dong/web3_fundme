const {ethers,deployments,getNamedAccounts} = require("hardhat")
const {assert,expect} = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")



describe("test fundtoken contract",async function(){
    let fundMe
    let fundMeSecondAccount
    let firstAccount
    let secondAccount
    let fundToken
    let fundTokenSecondAccount
    let fundTokenDeployment
    let fundMeDeployment

    beforeEach(async function(){
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount =(await getNamedAccounts()).secondAccount
        fundMeDeployment = await deployments.get("FundMe")
        fundTokenDeployment = await deployments.get("FundTokenERC20")
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe",secondAccount)
        await fundMe.fund({value: ethers.parseEther("1")})
        await fundMeSecondAccount.fund({value: ethers.parseEther("1")})
        await fundMe.fund({value: ethers.parseEther("2")})
        await fundMeSecondAccount.fund({value: ethers.parseEther("3")})
        await helpers.time.increase(190)
        await helpers.mine()
        fundToken = await ethers.getContract("FundTokenERC20",firstAccount)
        fundTokenSecondAccount = await ethers.getContract("FundTokenERC20",secondAccount)    
    })
   //fistAccount: 3 , secondAccount: 4 
    it("test if mint money grater than AmountFunded, you cannot mint this money tokens",
        async function(){
            await fundMe.getFund()
            await expect(fundToken.mint("20000000000000000000"))
            .to.be.revertedWith("you cannot mint this money tokens")

        }
    )
    it("test if mint money less than AmountFunded, you can mint this money tokens",
        async function(){
            await fundMe.getFund()
            await expect(fundToken.mint("2000000000000000000")).
            to.be.revertedWith("you do not have permission to call this function")
        }
    )
    it("test if funding is not completed , mint failed",
        async function(){
            await expect(fundToken.mint("2000000000000000000"))
            .to.be.revertedWith("funding is not completed")
        }
    )
    it("you can mint this money tokens",
        async function(){
            await fundMe.getFund()
            await fundMe.setERC20(fundTokenDeployment.address)
            
            await fundToken.mint("2000000000000000000")
            const _value = await fundMe.addressToAmountFunded(firstAccount)
            //console.log(`value:${_value}`)
            expect(_value).to.equal("1000000000000000000")
        }
    )

    it("you can claim this money tokens",
        async function(){
            await fundMe.getFund()
            await fundMe.setERC20(fundTokenDeployment.address)
            
            await fundTokenSecondAccount.mint("2000000000000000000")
            await fundTokenSecondAccount.claim("1500000000000000000")
            const _value = await fundTokenSecondAccount.balanceOf(secondAccount)
            //console.log(`value:${_value}`)
            expect(_value).to.equal("500000000000000000")
        }
    )
})