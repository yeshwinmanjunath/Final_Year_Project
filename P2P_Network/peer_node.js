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

    mineBlock(difficulty)
	{
        let target = Array(difficulty+1).join('0')
        while(this.hash.substring(0, difficulty).localeCompare(target)!=0)
		{
			//System.out.println("Current hash: "+hash.toString());
			this.nonce++;
			this.hash = this.calculateHash()
		}
		console.log("Block mined: " + this.hash)
	}
}

class BlockChain {

    constructor(genesis_block, difficulty){
        this.blockchain = [genesis_block] 
        this.difficulty = difficulty
        this.num_blocks=1
        this.blockchain[this.num_blocks-1].mineBlock(this.difficulty)
    }

    addBlock(new_block){
        this.blockchain.push(new_block)
        this.num_blocks++
        this.blockchain[this.num_blocks-1].mineBlock(this.difficulty)
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

//let block1 = new Block("First block", "0")
//console.log(block1)

let b1 = new BlockChain(new Block("First block", "0"), 3)
console.log("Second prev hash:"+b1.blockchain[b1.num_blocks-1].hash)
b1.addBlock(new Block("Second block", b1.blockchain[b1.num_blocks-1].hash))
b1.addBlock(new Block("Third block", b1.blockchain[b1.num_blocks-1].hash))
console.log(b1)
console.log("Blockchain validity: "+b1.isChainValid())
/**
 * Here we will save our TCP peer connections
 * using the peer id as key: { peer_id: TCP_Connection }
 */
const peers = {}
// Counter for connections, used for identify connections
let connSeq = 0

// Peer Identity, a random hash for identify your peer
const pvtKey = crypto.randomBytes(32)
const pubKey = crypto.randomBytes(32)

console.log('User Public Key: ' + pubKey.toString('hex'))

// reference to redline interface
let rl
/**
 * Function for safely call console.log with readline interface active
 */
function log () {
  if (rl) {
    rl.clearLine()    
    rl.close()
    rl = undefined
  }
  for (let i = 0, len = arguments.length; i < len; i++) {
    console.log(arguments[i])
  }
  askUser()
}

/*
* Function to get text input from user and send it to other peers
* Like a chat :)
*/
const askUser = async () => {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('Send message: ', message => {
    // Broadcast to peers
    for (let id in peers) {
      peers[id].conn.write(message)
    }
    rl.close()
    rl = undefined
    askUser()
  });
}

/** 
 * Default DNS and DHT servers
 * This servers are used for peer discovery and establishing connection
 */
const config = defaults({
  // peer-id
  id: pubKey,
})

/**
 * discovery-swarm library establishes a TCP p2p connection and uses
 * discovery-channel library for peer discovery
 */
const sw = Swarm(config)


;(async () => {

  // Choose a random unused port for listening TCP peer connections
  const port = await getPort()

  sw.listen(port)
  console.log('Listening to port: ' + port)

  /**
   * The channel we are connecting to.
   * Peers should discover other peers in this channel
   */
  sw.join('user-channel')

  sw.on('connection', (conn, info) => {
    // Connection id
    const seq = connSeq

    const peerId = info.id.toString('hex')
    log(`Connected #${seq} to peer: ${peerId}`)

    // Keep alive TCP connection with peer
    if (info.initiator) {
      try {
        conn.setKeepAlive(true, 600)
      } catch (exception) {
        log('exception', exception)
      }
    }

    conn.on('data', data => {
      // Here we handle incomming messages
      log(
        'Received Message from peer ' + peerId,
        '----> ' + data.toString()
      )
    })

    conn.on('close', () => {
      // Here we handle peer disconnection
      log(`Connection ${seq} closed, peer id: ${peerId}`)
      // If the closing connection is the last connection with the peer, removes the peer
      if (peers[peerId].seq === seq) {
        delete peers[peerId]
      }
    })

    // Save the connection
    if (!peers[peerId]) {
      peers[peerId] = {}
    }
    peers[peerId].conn = conn
    peers[peerId].seq = seq
    connSeq++

  })

  // Read user message from command line
  askUser()  

})()
