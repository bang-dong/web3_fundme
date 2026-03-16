// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//让FundMe的参与者，基于mapping来领取相应数量通证
//让FundMe的参与者，transfer通证
//使用完成后，需要burn通证

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {FundMe} from "./FundMe.sol";

contract FundTokenERC20 is ERC20 {
    FundMe fundMe;
    constructor(address fundMeAddress) ERC20("FundTokenERC20", "FT")  {
        fundMe = FundMe(fundMeAddress);
    }

    function mint(uint256 amountToMint) public {
        require(fundMe.addressToAmountFunded(msg.sender) >= amountToMint,"you cannot mint this money tokens");
        require(fundMe.fundingComplete(),"funding is not completed");
        _mint(msg.sender, amountToMint);
        fundMe.setAddressToAmount(msg.sender, fundMe.addressToAmountFunded(msg.sender) - amountToMint);
    }

    function claim(uint256 amountToBurn) public {
        require(fundMe.fundingComplete(), "funding is not completed");
        require(balanceOf(msg.sender) >= amountToBurn, "you do not have enough ERC20 tokens");
        _burn(msg.sender, amountToBurn);
    }
}