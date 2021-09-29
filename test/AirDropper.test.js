const { expect } = require("chai");
const { BN } = require('@openzeppelin/test-helpers');

let contracts =  {
        AirDropper:  artifacts.require('AirDropper'),
        MockToken: artifacts.require('MafiaArtMock'),
}

describe("AirDropper", function() {
  before(async function () {
      this.accounts = await web3.eth.getAccounts();

      this.owner = this.accounts[0];
      this.alice = this.accounts[1];
      this.bob = this.accounts[2];
      this.carol = this.accounts[3];
      this.notOwner = this.accounts[4];
      this.testAddr = this.accounts[5];
  });

  beforeEach(async function () {
      this.mockObsToken = await contracts.MockToken.new("ObsMafia", "OBS");
      this.mockNewToken = await contracts.MockToken.new("NewMafia", "NEW");
      this.airDropper = await contracts.AirDropper.new(this.mockObsToken.address, this.mockNewToken.address);

      await this.mockObsToken.allowMinter(this.owner);
      await this.mockNewToken.allowMinter(this.owner);
      await this.mockNewToken.allowMinter(this.airDropper.address);
  });

  it("recallTokens - 20 consecutive obselete mints", async function() {
    let mintables = [...Array(20).keys()];
    for (let i=0; i < mintables.length; i++) {
      await this.mockObsToken.mint(this.bob, i+1);
    }
     await this.airDropper.recallTokens();
     expect(await this.mockNewToken.totalSupply()).to.be.bignumber.equal(new BN(20));
  });

  it.skip("recallTokens - 50 consecutive obselete mints, finished on three runs", async function() {
    let mintables = [...Array(50).keys()];
    for (let i=0; i < mintables.length; i++) {
      await this.mockObsToken.mint(this.bob, i+1);
    }
     await this.airDropper.recallTokens();
     expect(await this.mockNewToken.totalSupply()).to.be.bignumber.equal(new BN(20));

     await this.airDropper.recallTokens();
     expect(await this.mockNewToken.totalSupply()).to.be.bignumber.equal(new BN(40));

     await this.airDropper.recallTokens();
     expect(await this.mockNewToken.totalSupply()).to.be.bignumber.equal(new BN(50));
  });
   
  // takes  alot of time to run - might need to increase timeout on different devices
  it.only("recallTokens - almost realistic scenario", async function() {
    // total of 150 tokens need recall
    // Zeroth 2000 newTokens are complete
    // First 2000 missing 15 (should be minted according to obsTokens)
    // Second 2000 missing 85
    // Third 2000 missing 30 
    // Fourth 2000 missing 20 
    
    // ---- Setting up the test ----------
    let missing1 = [2001, 2040, 2050, 2055, 2061, 3001, 3002, 3003, 3500, 3501, 3502, 3503, 3504, 3505, 3506];
    let missing2 = [...Array(60).keys()].map(x => x+4001);
    missing2 = missing2.concat( [...Array(10).keys()].map(x => x+4101) );
    missing2 = missing2.concat( [...Array(15).keys()].map(x => x+4151) );
    let missing3 = [...Array(30).keys()].map(x => x+6011);
    let missing4 = [...Array(20).keys()].map(x => x+8133);

    for (let i of missing1  ) {
      await this.mockObsToken.mint(this.bob, i);
    }

    for (let i of missing2  ) {
      await this.mockObsToken.mint(this.alice, i);
    }

    for (let i of missing3  ) {
      await this.mockObsToken.mint(this.bob, i);
    }

    for (let i of missing4  ) {
      await this.mockObsToken.mint(this.owner, i);
    }

    let newMintables  = [...Array(10000).keys()].map(x => x+1);
    newMintables =  newMintables.filter(x => ! (new Set(missing1).has(x)));
    newMintables =  newMintables.filter(x => ! (new Set(missing2).has(x)));
    newMintables =  newMintables.filter(x => ! (new Set(missing3).has(x)));
    newMintables =  newMintables.filter(x => ! (new Set(missing4).has(x)));

    for (let i of newMintables.slice(0, 500)  ) {
      await this.mockNewToken.mint(this.alice, i);
    }

    console.log("Done minting tokens for carol .... ");

    for (let i of newMintables.slice(500, 2000)  ) {
      await this.mockNewToken.mint(this.alice, i);
    }

    console.log("Done minting tokens for alice .... ");

    for (let i of newMintables.slice(2000, 5000)  ) {
      await this.mockNewToken.mint(this.bob, i);
    }

    console.log("Done minting tokens for bob .... ");

    for (let i of newMintables.slice(5000, 10000)  ) {
      await this.mockNewToken.mint(this.owner, i);
    }

    console.log("Done minting tokens for owner .... ");

    // ----- done  setup test -----------
    
    let newTokenSupply = await this.mockNewToken.totalSupply();
    expect(await this.mockNewToken.totalSupply()).to.be.bignumber.equal(new BN (10000 - 150));

    await this.airDropper.recallTokens();
    expect(await this.airDropper.head()).to.be.bignumber.equal(new BN(2001));
    expect(await this.mockNewToken.totalSupply()).to.be.bignumber.equal(newTokenSupply);

    await this.airDropper.recallTokens();
    newTokenSupply = newTokenSupply.add(new BN(15));
    expect(await this.mockNewToken.totalSupply()).to.be.bignumber.equal(newTokenSupply);
    expect(await this.airDropper.head()).to.be.bignumber.equal(new BN(4001));

    await this.airDropper.recallTokens();
    newTokenSupply = newTokenSupply.add(new BN(20));
    expect(await this.airDropper.head()).to.be.bignumber.equal(new BN(4021));
    expect(await this.mockNewToken.totalSupply()).to.be.bignumber.equal(newTokenSupply);

 
  });

});