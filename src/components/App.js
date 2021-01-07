import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from "../abis/DaiToken.json"
import DappToken from "../abis/DappToken.json"
import TokenFarm from "../abis/TokenFarm.json"
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {


// This is how the Dapp will connect to MetaMask
  // 'componentWillMount' is a 'life-cycle' fxn inside react (more info at reactjs.org)
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  // This fxn fetches data from the blockchain
  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})

    //determine the network we're connected to
    const networkId = await web3.eth.net.getId()

    //Load DAI token (deposited by investor)
    const daiTokenData = DaiToken.networks[networkId]   //fetches data from DaiToken.json
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)    //creates a javascript version of the smart contract using web3
      this.setState({ daiToken})
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    //Load Dapp token (earned by investor)
    const dappTokenData = DappToken.networks[networkId]   //fetches data from DappToken.json
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)    //creates a javascript version of the smart contract using web3
      this.setState({ dappToken})
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
    } else {
      window.alert('DappToken contract not deployed to detected network.')
    }

    //Load Dapp token (earned by investor)
    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }

    //while the dapp is laoding we don't want to show the content on the page
    this.setState({ loading: false })   //by default 'loading' is set to true, but once we're done loading data from the blockchain, we are done so we set it to false
  }


  async loadWeb3() {
    // Looks for ethereum object, and makes a new Web3 object
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    // If Web3 object already exists then use it to create connection
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    // If browser is not ethereum/metamask enabled
    else {
      window.alert('Non-Ethereum browser detected. You should trying MetaMask!')
    }
  }


  //We call the fxn and pass in 'amount', set the loading state to true and then we interact with the blockchain in a multistep step process (lines 87-89): We approve tokens for 'amount' so they can be spent, Then we send the txn from the current account, When that's finished we stake the tokens, Then send the txn from the account, When that's finished set the 'loading' state back to false.
  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account}).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},    // load smart contract and store it in this state
      dappToken: {},   // load smart contract and store it in this state
      tokenFarm: {},   // load smart contract and store it in this state
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
