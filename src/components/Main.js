import React, { Component } from 'react'
import dai from '../dai.png'

class Main extends Component {



  render() {
    return (
      <div id="content" className="mt-3">

        <table className="table table-borderless text-muted text-center">
          <thead>
            <tr>
              <th scope="col">Staking Balance</th>
              <th scope="col">Reward Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{window.web3.utils.fromWei(this.props.stakingBalance, 'Ether')} mDAI</td>
              <td>{window.web3.utils.fromWei(this.props.dappTokenBalance, 'Ether')} DAPP</td>
            </tr>
          </tbody>
        </table>

        <div className="card mb-4">

          <div className="card-body">

            <form className="mb-3" onSubmit={(event) => {
              event.preventDefault()
              let amount
              amount = this.input.value.toString()    //gets input amount of tokens investor would like to stake
              amount = window.web3.utils.toWei(amount, 'Ether')   //converts amount to Wei units
              this.props.stakeTokens(amount)    //call the 'stakeTokens' fxn
            }}>
              <div>
                <label className="float-left"><b>Stake Tokens</b></label>
                <span className="float-right text-muted">
                  Balance: {window.web3.utils.fromWei(this.props.daiTokenBalance, 'Ether')}
                </span>
              </div>
              <div className="input-group mb-4">
                <input
                  type="text"
                  ref={(input) => { this.input = input }}   //this 'ref' line allows us to reference 'input' in the from onSubmit event above (lines 34 & 35)
                  className="form-control form-control-lg"
                  placeholder="0"
                  required />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <img src={dai} height='32' alt=""/>
                    &nbsp;&nbsp;&nbsp; mDAI
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg">STAKE!</button>
            </form>
            <button
              type="submit"
              className="btn btn-link btn-block btn-sm"
              onClick={(event) => {
                event.preventDefault()
                this.props.unstakeTokens()
              }}>
              UN-STAKE...
            </button>
          </div>
        </div>

      </div>
    );
  }
}

export default Main;
