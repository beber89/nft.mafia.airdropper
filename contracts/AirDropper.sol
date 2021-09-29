// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";



abstract contract MafiaArtInterface is IERC721 {
  function mint(address, uint256 ) public {}
  function totalSupply() external view returns (uint256) {}
}

contract AirDropper is Ownable {
  using SafeMath for uint256;

  MafiaArtInterface public obsToken;
  MafiaArtInterface public newToken;

  uint256 public head = 1;
  uint256 public maxMint = 20;

  uint256 public loopLimit=2000;
  uint256 public targetSupply=10000;

  
  constructor(address tokenAddressObselete, 
    address tokenAddressNew
  ) {
    obsToken = MafiaArtInterface(tokenAddressObselete);
    newToken = MafiaArtInterface(tokenAddressNew);
  }

  function setTargetSupply(uint256 targetSupply_) external onlyOwner {
    // total supply of tokens which is 10000
      targetSupply = targetSupply_;
  }

  function setLoopLimit(uint256 loopLimit_) external onlyOwner {
    // loop limit to go through
      loopLimit = loopLimit_;
  }

  function setHead(uint256 head_) external onlyOwner {
    // last token stopped by
    // Should not be set manually (unless something really wrong went on)
      head = head_;
  }

  function setMaxMint(uint256 maxMint_) external onlyOwner {
    // max amount of mint in one take
      maxMint = maxMint_;
  }


  function setObsTokenAddress(address tokenAddress) external onlyOwner {
    obsToken = MafiaArtInterface(tokenAddress);
  }

  function setNewTokenAddress(address tokenAddress) external onlyOwner {
    newToken = MafiaArtInterface(tokenAddress);
  }

  function recallTokens() external {
    // Guidelines for recall
    // 1- Loop through new token Ids
    // 2- check missing ids with no owners
    // 3- mint those missing ids for corresponding owners from old token

      require(newToken.totalSupply() < targetSupply, "recallTokens: All tokens have been recalled");
    
    uint32 count = 0;

    uint256 endLoop = head.add(loopLimit) > targetSupply + 1? targetSupply + 1 : head.add(loopLimit);

    uint256 i;
    for (i = head; i < endLoop; i+=1) {
      if (count >= maxMint) {
        break;
      }

      address newTokenHolder = _getHolder(newToken, i);
      address obsTokenHolder = _getHolder(obsToken, i);
       if (newTokenHolder == address(0) && obsTokenHolder != address(0)) {
          newToken.mint(obsTokenHolder, i);
          count += 1;
       }
    }
    head = i;
  }

  function _getHolder(MafiaArtInterface token, uint256 tokenId) private returns (address) {
    address holder;
    try token.ownerOf(tokenId) returns (address _holder){
      return _holder;
    } catch {
      return address(0);
    }
  }

  function finalize() external onlyOwner  {
    selfdestruct(payable(owner()));
  }

}