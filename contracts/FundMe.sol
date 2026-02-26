// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

//创建一个收款函数
//记录投资人并且查看
//锁定期内，达到目标值，生产商提款
//锁定期内，未达到目标值，退款

contract FundMe{
    mapping ( address => uint256) public addressToAmountFunded;
    uint256 public minimumUSD = 1 * 10 ** 18; // 1 USD
    uint256 public constant FUNDING_GOAL_IN_USD = 50 * 10 ** 18; // 50 USD
    uint256 public FUNDING_DEADLINE;
    uint256 public FUNDING_TIMESTAMP;
    address owner;
    address ERC20addr;
    AggregatorV3Interface internal dataFeed;
    bool public fundingComplete;

    constructor(uint256 _FUNDING_DEADLINE){
        owner = msg.sender;
        FUNDING_DEADLINE = _FUNDING_DEADLINE;
        FUNDING_TIMESTAMP = block.timestamp;
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

    }
    
    modifier onlyowner(){
        require(msg.sender == owner);
        _;
    }
    modifier afterDeadline() {
        require(block.timestamp > FUNDING_TIMESTAMP + FUNDING_DEADLINE);
        _;
    }
    
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    function fund() external payable {
        require(block.timestamp < FUNDING_TIMESTAMP + FUNDING_DEADLINE, "window is closed");
        require(convertEthToUsd(msg.value) >= minimumUSD,"send more ETH");
        addressToAmountFunded[msg.sender] += msg.value;
    }
    function getFund() public afterDeadline onlyowner{
        require(convertEthToUsd(address(this).balance) >= FUNDING_GOAL_IN_USD);
        bool success;
        (success,)=payable (msg.sender).call{value:address(this).balance}("");
       //payable (msg.sender).transfer(address(this).balance);
        fundingComplete = true;
    }
    function getRefund() public afterDeadline{
        require(convertEthToUsd(address(this).balance) < FUNDING_GOAL_IN_USD);
        bool success;
        (success,)= payable(msg.sender).call{value:addressToAmountFunded[msg.sender]}("");
        //payable (msg.sender).transfer(addressToAmountFunded[msg.sender]);
        addressToAmountFunded[msg.sender] = 0 ;
    }

    function setowner(address newOwner) public onlyowner{
        owner = newOwner;
    }

    function setERC20(address _erc20) public onlyowner{
        ERC20addr = _erc20;
    }

    function setAddressToAmount(address _address, uint256 _amountupdate) external {
        require(msg.sender == ERC20addr,"you do not have permission to call this function");
        addressToAmountFunded[_address] = _amountupdate;
    }
    
}