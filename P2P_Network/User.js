const crypto = require('crypto')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const readline = require('readline')

const peers = {}
let connSeq = 0

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
  askUser()
}

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

    /*conn.on('data', data => {
      
      log(
        'Received Message from miner ' + peerId,
        '----> ' + data.toString()
      )
    })*/

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

  askUser()
})()