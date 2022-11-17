import { expect } from "chai";
import { Signer, BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Exchange, Token } from "../typechain-types";

function toWei(value: number) {
    return ethers.utils.parseEther(value.toString())
}

function fromWei(value: BigNumber) {
    return ethers.utils.formatEther(value)
}

describe("Exchange", function () {

    let bob: Signer
    let bobToken: Token
    let alice: Signer
    let aliceToken: Token
    let exchange: Exchange

    it("should deployed", async function () {
        [bob, alice] = await ethers.getSigners()

        const Token = await ethers.getContractFactory('Token')
        bobToken = await Token.connect(bob).deploy('Bob Token', 'BOB', 100)
        aliceToken = await Token.connect(alice).deploy('Alice Token', 'ALI', 100)

        const Exchange = await ethers.getContractFactory('Exchange')
        exchange = await Exchange.connect(bob).deploy(bobToken.address, aliceToken.address, await alice.getAddress())
        await exchange.deployed()

        expect(exchange.address).not.to.be.null
    })

    it("Should revert with the right error if Alice call exchange() before initialized", async function () {
        await expect(exchange.connect(alice).exchange(toWei(100))).to.revertedWith('!initialized')
    })

    it("should revert with the right error if Bob call initialize(), but not approve bobToken to exchange contract", async function () {
        await expect(exchange.connect(bob).initialize(toWei(100))).to.revertedWith('ERC20: insufficient allowance')
    })

    it("should initialize [Bob]", async function () {
        const approveTx = await bobToken.connect(bob).approve(exchange.address, toWei(100))
        await approveTx.wait()

        const tx = await exchange.connect(bob).initialize(toWei(100))
        await tx.wait()

        expect(await exchange.initialized()).to.be.true
        expect(await exchange.exchangeAmount()).to.equals(toWei(100))
    })

    it("should revert with the right error if Bob call initialize() again", async function () {
        await expect(exchange.connect(bob).initialize(toWei(100))).to.revertedWith('initialized')
    })

    it("should revert with the right error if Bob call withdraw() before expired timestamp", async function () {
        await expect(exchange.connect(bob).withdraw()).to.revertedWith('!expired')
    })

    it("should revert with the right error if Alice exchange with invalid amount", async function () {
        await expect(exchange.connect(alice).exchange(toWei(10))).to.revertedWith('!eq to exchange amount')
    })

    it("should revert with the right error if Alice not approve token to Exchange contract", async function () {
        await expect(exchange.connect(alice).exchange(toWei(100))).to.revertedWith('ERC20: insufficient allowance')
    })

    it('should exchange [Alice]', async function () {
        const approveTx = await aliceToken.connect(alice).approve(exchange.address, toWei(100))
        await approveTx.wait()

        const tx = await exchange.connect(alice).exchange(toWei(100))
        await tx.wait()

        expect(await exchange.exchanged()).to.be.true
        expect(await aliceToken.balanceOf(await bob.getAddress())).to.equals(toWei(100))
        expect(await bobToken.balanceOf(await alice.getAddress())).to.equals(toWei(100))
    })
})