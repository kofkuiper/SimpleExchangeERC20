import { ethers, run } from "hardhat";

async function main() {
  const [Bob, Alice] = await ethers.getSigners()

  const Token = await ethers.getContractFactory('Token')
  const bobToken = await Token.connect(Bob).deploy('Bob Token', 'BOB', 100)
  await bobToken.deployed()
  console.log('Bob Token deployed to: ', bobToken.address);

  const aliceToken = await Token.connect(Alice).deploy('Alice Token', 'ALI', 100)
  await aliceToken.deployed()
  console.log('Bob Token deployed to: ', aliceToken.address);
  // await run('verify:verify', {
  //   address: shipyard.address,
  //   constructorArguments: [],
  //   contract: 'contracts/Shipyard.sol:Shipyard'
  // })

  const ExchangeV2 = await ethers.getContractFactory('ExchangeV2')
  const exchangeV2 = await ExchangeV2.connect(Bob).deploy(bobToken.address, aliceToken.address, Alice.address)
  await exchangeV2.deployed()
  console.log('ExchangeV2 deployed to: ', exchangeV2.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
