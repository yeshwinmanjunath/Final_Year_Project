const crypto = require('crypto')
var crypto_NEW = require('crypto-js')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const readline = require('readline')

class Block {
  constructor(data, previousHash){
		this.data = data
		this.previousHash = previousHash
		this.timeStamp = new Date().getTime()
		this.nonce = 0
		this.hash = this.calculateHash()
  }

  calculateHash(){
    return crypto_NEW.SHA256(
      this.previousHash + 
      this.timeStamp.toString() + 
      this.nonce.toString()
    ).toString()
  }

  mineBlock(difficulty, conn){
    let target = Array(difficulty+1).join('0')
    while(this.hash.substring(0, difficulty).localeCompare(target)!=0)
		{
			//System.out.println("Current hash: "+hash.toString());
			this.nonce++;
      this.hash = this.calculateHash()
      //CHECK FOR INCOMING MESSAGE??
      console.log("Still mining, checking for incoming message...")
      conn.on('data', data => {
        //Received a message
        log('Received Message from peer ' + peerId,'----> ' + data.toString())
        //Convert from string of ASCII values to string of characters
        let data_new = ""
        for(let i=0; i<data.length; i++)
        {
          data_new+=String.fromCharCode(data[i])
        }
        data = data_new
        if(data[0]==='m')
        {
          //Message from miner
          log('Received block from miner ' + peerId)
          let currtimeStamp = new Date().getTime()
          console.log("Current time "+ currtimeStamp)
        }
        return
      })
		}
		//console.log("Block mined: " + this.hash)
	}
}

class BlockChain {

  constructor(genesis_block, difficulty, conn){
    this.blockchain = [genesis_block] 
    this.difficulty = difficulty
    this.num_blocks=1
    this.blockchain[this.num_blocks-1].mineBlock(this.difficulty, conn)
  }

  addBlock(new_block, conn){
    this.blockchain.push(new_block)
    this.num_blocks++
    this.blockchain[this.num_blocks-1].mineBlock(this.difficulty, conn)
  }

  isChainValid()
	{
		for(let i=1; i<this.num_blocks; i++)
		{
			let prevB = this.blockchain[i-1]
			let currB = this.blockchain[i]
			if(currB.hash.localeCompare(currB.calculateHash())!=0)
			{
				console.log("Current hash changed")
				return false
			}
			if(prevB.hash.localeCompare(currB.previousHash)!=0)
			{
				console.log("Previous hash changed")
				return false
			}
		}
		return true
	}

}

//Declare blockchain
var BlockChain1

//List of peers: {peer id, connection}
const peers = {}
let connSeq = 0

//Randomly generate ID
const myId = crypto.randomBytes(32)
console.log('Your identity: ' + myId.toString('hex'))

let rl
function log () {
  if (rl) {
    rl.clearLine()    
    rl.close()
    rl = undefined
  }
  for (let i = 0, len = arguments.length; i < len; i++) {
    console.log(arguments[i])
  }
  //askUser()
}


//REQUIRED - ASYNCHRONOUS FUNCTION : SEND MINED BLOCK UPON SUCCESSFUL MINING
//Note: Prepend 'm' to starting of message to indicate sender is miner
/*
const askUser = async () => {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('Send message: ', message => {
    for (let id in peers) {
      peers[id].conn.write(message)
    }
    rl.close()
    rl = undefined
    askUser()
  });
}
*/

const config = defaults({
  id: myId,
})

const sw = Swarm(config)

;(async () => {

  const port = await getPort()

  sw.listen(port)
  console.log('Listening to port: ' + port)

  sw.join('miner_channel')
  sw.on('connection', (conn, info) => {
    
    const seq = connSeq

    const peerId = info.id.toString('hex')
    log(`Connected #${seq} to peer: ${peerId}`)

    if (info.initiator) {
      try {
        conn.setKeepAlive(true, 600)
      } catch (exception) {
        log('exception', exception)
      }
    }

    conn.on('data', data => {
      //Received a message
      log('Received Message from peer ' + peerId,'----> ' + data.toString())

      //Convert from string of ASCII values to string of characters
      let data_new = ""
      for(let i=0; i<data.length; i++)
      {
        data_new+=String.fromCharCode(data[i])
      }
      data = data_new
      
      if(data[0]==='u')
      {
        //Message from user, create block for transaction
        log('Received transaction from user ' + peerId,'----> ' + data.slice(1).toString())
        if (typeof BlockChain1 != "undefined") {    
          //Blockchain already exists, use existing
          console.log("Blockchain already exists")
          //First check if chain is valid
          if(BlockChain1.isChainValid())
          {
            console.log("Chain is valid")
            let new_block =new Block(data.slice(1), BlockChain1.blockchain[BlockChain1.num_blocks-1].hash)
            console.log("Mined new block")
            BlockChain1.addBlock(new_block, conn)
            console.log("Appended to blockchain"+JSON.stringify(BlockChain1.blockchain))
          }
        }
        else {                      
          //Blockchain doesn't already exist, create now
          console.log("Blockchain doesn't exist")
          let genesis_block = new Block(data.slice(1), "0")
          console.log("Mined genesis block")
          BlockChain1 = new BlockChain(genesis_block, 5, conn)
          console.log("Created blockchain"+JSON.stringify(BlockChain1.blockchain))
        }
        //Broadcast mined block to other miners
        console.log("Broadcasting block")
        for (let id in peers) {
          peers[id].conn.write('m'+
            JSON.stringify(
            BlockChain1.blockchain[BlockChain1.num_blocks-1]
            )
          )
        }
        console.log("Finished Broadcasting block")   
      }
      else if(data[0]==='m')
      {
        //Message from miner
        log('Received block from miner ' + peerId)
        //Extract the block from message
        let new_block = JSON.parse(data.slice(1))
        if (typeof BlockChain1 != "undefined") {      
          //Blockchain already exists, use existing
          console.log("Blockchain already exists")
          //First check if chain is valid 
          if(BlockChain1.isChainValid())
          {
            console.log("Chain is valid")
            BlockChain1.addBlock(new_block, conn)
            console.log("Appended to blockchain"+JSON.stringify(BlockChain1.blockchain))
          }
        }
        else{
          //Blockchain doesn't already exist, create now
          console.log("Blockchain doesn't exist")
          BlockChain1 = new BlockChain(new_block, 5, conn)
          console.log("Created blockchain"+JSON.stringify(BlockChain1.blockchain))
        }
      }
    })

    conn.on('close', () => {
      // Here we handle peer disconnection
      log(`Connection ${seq} closed, peer id: ${peerId}`)
      // If the closing connection is the last connection with the peer, removes the peer
      if (peers[peerId].seq === seq) {
        delete peers[peerId]
      }
    })

    if (!peers[peerId]) {
      peers[peerId] = {}
    }
    peers[peerId].conn = conn
    peers[peerId].seq = seq
    connSeq++
  })
  //askUser()
})()
