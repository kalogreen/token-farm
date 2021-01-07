// In order to do the testing we';; be using some nice libs allowing us to create the test. Two of those are: chai (chaijs.com), and mocha (mochajs.org)

const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

// Helper fxn to prevent having to keep typing out web3.utils.toWei('','')
function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {

    let daiToken, dappToken, tokenFarm

    // create a before hook, ie a fxn that gets run before every single test example
    before(async () => {
        // Load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        // Transfer all Dapp tokens to farm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        // Send tokens to investor
        await daiToken.transfer(investor, tokens('100'), { from: owner})
    })



    // Write tests here...

    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result

            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)     //check Dai token balance before they deposit it into the app so that we can make sure it has gone down after they deposit it into the app.
            assert.equal(result.toString(), tokens('100'), 'investor Mock Dai wallet balance correct before staking')

            // Stake Mock DAI Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor})
            await tokenFarm.stakeTokens(tokens('100'), { from: investor})

            // Check staking result
            result = await daiToken.balanceOf(investor)     //checking investor balance is 0 after staking 100 mDAI
            assert.equal(result.toString(), tokens('0'), 'investor Mock Dai wallet balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)        //checking tokenFarm balance has increased by the amount put in by investor, 100 mDAI here
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock Dai wallet balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)       //checking the investor's staking balance in tokenFarm shows what he has put in, here 100 mDAI
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            // Issue Tokens
            await tokenFarm.issueTokens({ from: owner})

            // Check balances after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct after issuance')

            // Ensure that only owner can issue tokens
            await tokenFarm.issueTokens({ from: investor}).should.be.rejected;

            // Unstake tokens
            await tokenFarm.unstakeTokens({ from: investor})

            // Check results after staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm DAI balance correct after unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after unstaking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after unstaking')
        })
    })
})
