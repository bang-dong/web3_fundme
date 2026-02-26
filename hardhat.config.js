require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("./tasks/deploy-fundme")

const SEPOLIA_URL = process.env.SEPOLIA_URL
const ACCOUNT = process.env.ACCOUNT
const API_KEY = process.env.API_KEY 

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks:{
    sepolia:{
      url: SEPOLIA_URL,
      accounts:[ACCOUNT],
      chainId:11155111
    }
  },
  etherscan:{
    apiKey:{
      sepolia:API_KEY
    }
  }
};
