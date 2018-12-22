var swarm = require('discovery-swarm')
const crypto = require('crypto')
const getPort = require('get-port'); //to generate random ports for each system

var readline = require('readline')
//var Sync = require('sync');
 //counter;
let counter =0;
peers =[]
var sw = swarm(
  {
   id: crypto.randomBytes(32), // peer-id for user
    //extracted as sw.id
    
   // stream: stream, // stream to replicate across peers
   // connect: fn, // connect local and remote streams yourself
   // utp: true, // use utp for discovery
    //tcp: true, // use tcp for discovery
   // maxConnections: 0, // max number of connections.
  //  whitelist: [] // array of ip addresses to restrict connections to
  }

);

//sw.listen(65002)  cant use same port for different systems in distr
(async () => {
  const port = await getPort()  //assign random valid port
 sw.listen(port) //distr prog listens to 'port' of this peer

//sw.join('fun-channel')
})();

sw.join('fun-channel') 

peers.push(sw.id.toString('hex'))  //add all peer-id to array peers
//on connection of peer event
sw.on('connection', function (connection,peer) { //this event invokes when peers joins network
  console.log("1")
  peers[counter++]=peer.id.toString('hex');  //peer.id gives connected peer id whereas sw.id gives current programs peer's id

  
 //console.log('found + connected to peer ',peers[counter-1],counter);
 //for (let id in peers) {
 // console.log(peer.id.toString('hex'))
  //console.log(sw.id.toString('hex'))

})



//readline
rl = readline.createInterface(process.stdin, process.stdout)

//event handling  
rl.on('line', function(line){
  
  for (let id in peers) {
    id.connection.send(line)
    rl.prompt();
  }
}).on('close', function() {

  for(var i=0;i<counter;i++)
  console.log(peers[i],'\n')
  console.log('Have a great day!');
  process.exit(0);
});




for (let id in peers){

  console.log(counter)

}
