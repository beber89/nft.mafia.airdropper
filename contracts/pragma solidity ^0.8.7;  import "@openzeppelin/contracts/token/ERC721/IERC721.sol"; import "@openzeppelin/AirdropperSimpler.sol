pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract MafiaArtInterface is IERC721 {
    function mint(address, uint256) public {}

    function totalSupply() external view returns (uint256) {}
}

interface IAirdropper {
    function airdrop(uint256[] memory tokenIds) external returns (bool);
}

contract AirDropper is Ownable, IAirdropper {
    MafiaArtInterface public obsToken;
    MafiaArtInterface public newToken;
    
    constructor(address tokenAddressObselete, address tokenAddressNew) {
        obsToken = MafiaArtInterface(tokenAddressObselete);
        newToken = MafiaArtInterface(tokenAddressNew);
    }

    function airdrop(uint256[] memory tokenIds)
        external
        override
        onlyOwner
        returns (bool)
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            address holder = _getHolder(tokenIds[i]);
            if (holder != address(0) && validate(tokenIds[i])) {
                newToken.mint(holder, tokenIds[i]);
            }
        }
        return true;
    }

    function _getHolder(uint256 tokenId) public view returns (address) {
        try obsToken.ownerOf(tokenId) returns (address _holder) {
            return _holder;
        } catch {
            return address(0);
        }
    }
    
    function validate(uint256 tokenId) public view returns (bool) {
         try newToken.ownerOf(tokenId) {
           return false;
        } catch {
            return true;
        }
    }
    
    function finalize() external onlyOwner {
        selfdestruct(payable(owner()));
    }
}
