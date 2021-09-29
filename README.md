## How it works
- The AirDropper loops through the new NFT IDs untill it finds missing ID then it mints that ID for the owner of the same ID from the obselete NFT.
- This shall Run on remix.
- It mints maximum 20 NFTs on one call to `recallTokens()`.
- It loops maximum 2000 of the new Alcabone NFTs.

## Deployment
- Deploy with arguments `constructor(x1, x2)` 
  - `x1`: address of obselete NFT
  - `x2`: address of new NFT which is to be airdropped
- On the new NFT call `allowMinter(address)` while `address` is the address of this contract after it is deployed.
