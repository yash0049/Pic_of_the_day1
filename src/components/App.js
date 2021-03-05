import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import Meme from '../abis/Meme.json'
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) 

class App extends Component {
async componentWillMount(){
  await this.loadWeb3()
  await this.loadBlockChainData()
}
//Get account
//Get network
//Get smart contract
//--->ABI:Meme.abi
//--->Address:NetworkData.address
//Get meme hash
  async loadBlockChainData(){
   const web3=window.web3
   const accounts = await web3.eth.getAccounts()
   this.setState({ accounts: accounts[0] })
   console.log(accounts[0])
   const NetworkId=await web3.eth.net.getId()
   console.log(NetworkId)
   const NetworkData=Meme.networks[NetworkId]
   console.log(NetworkData)
  if(NetworkData){
    //fetch sc
    const abi=Meme.abi
    const address=NetworkData.address
    const contract=web3.eth.Contract(abi,address)
    this.setState({contract})
    console.log(contract)
    const hash=await contract.methods.get().call()
    this.setState({hash})
    console.log(hash)
  }
  else{
  window.alert('Smart Contract not deployed to network')  
  }
   
  }
  constructor(props){
    super(props);
    this.state ={
      buffer:null,
      hash:'',
      accounts:null,
      contract:null
    };
  }

  async loadWeb3(){
    if(window.ethereum){
      window.web3=new Web3(window.ethereum)
      await window.ethereum.enable() 

    }if(window.Web3){
      window.web3=new Web3(window.web3.currentProvider)

    }else{
      window.alert('please use metamask')
    }
  }

  capturefile=(event)=>{
    event.preventDefault();
//process the file after upload
const file=event.target.files[0];
const reader=new window.FileReader();
reader.readAsArrayBuffer(file);
reader.onloadend=()=>{
  this.setState({buffer:Buffer(reader.result)});
  console.log('buffer',Buffer(reader.result))
  //console.log(this.state)
}
  }
  //Example hash:"QmNi7857vXUAbMZeVxry6MeEXH75BieZRd5UoyyWMBA7gj"  
  //Example hash2:"QmQxcWB8Pq6cQzKdetreo9n8tynmAVF8sfNpAQrMwVRVz7"
  //Example url:"https://ipfs.io/ipfs/QmNi7857vXUAbMZeVxry6MeEXH75BieZRd5UoyyWMBA7gj"
  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      const hash=result[0].hash
      this.setState({hash})
      if(error) {
        console.error(error)
        return
      }
      //Store file on blockchain here
      this.state.contract.methods.set(hash).send({from: this.state.accounts}).then((r)=>{
        this.setState({hash})
      })
    })
  }
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
           Pic of the day
          </a>
          <p>&nbsp;</p>
              <small className="text-white">{this.state.accounts}</small>
         </nav>
        
       <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  
                  <img src={`https://ipfs.io/ipfs/${this.state.hash}`} alt="meme"  />
              </a>
              <p>&nbsp;</p>
              <h2>Change Pic</h2>
              <form onSubmit={this.onSubmit}>
                <input type="file" onChange={this.capturefile}/>
                <input type="submit"/>
              
              </form>
             
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
