var swarm = require('discovery-swarm')
const crypto = require('crypto')
const getPort = require('get-port'); //to generate random ports for each system
var readline = require('readline')
//var Sync = require('sync');
 //counter;
  let counter =0;
const peers ={}
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

//sw.listen(65002)  cant use same port from same system
(async () => {
  const port = await getPort()
 sw.listen(port)

//sw.join('fun-channel')
})();

sw.join('fun-channel')
var stdin = process.openStdin();
  //add all peer-id to array peers
//on connection of peer event
sw.on('connection',  function(conn,info) {

//console.log("this is conn",conn)

/* info contains
{ type: 'tcp', // the type, tcp or utp.
  initiator: true, // whether we initiated the connection or someone else did.
  channel: Buffer('...'), // the channel this connection was initiated on. only set if initiator === true.
  host: '127.0.0.1', // the remote address of the peer.
  port: 8080, // the remote port of the peer.
  id: Buffer('...') // the remote peer's peer-id.
}

*/
  var peerid=info.id.toString('hex')
  peers[counter]=conn
  //peers.k2 =counter
  counter++

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 

    console.log("you entered: " , d.toString().trim()  );
    //for (let id in peers) 
    for(let v of Object.entries(peers)){
     v[1].write(d.toString().trim())
    }
  });

  conn.on('data', function(data)  {
    // Here we handle incomming messages
    console.log(
      'Received Message from peer ' +
      '----> ' + data.toString()
    )
  })


/*conn.on('data',function(data)
{
  stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 
    console.log("you entered: [" + 
        d.toString().trim() + "]");
  });
  

})
conn.on('close',function()
{
console.log("connection closed");

})*/


  //console.log("1")

 

 // peers[counter++]=info.id.toString('hex');



 //console.log('found + connected to peer ',peers[counter-1],counter);
 //for (let id in peers) {
 // console.log(peer.id.toString('hex'))
  //console.log(sw.id.toString('hex'))

})




/*
//readline
rl = readline.createInterface(process.stdin, process.stdout)

//event handling  
rl.on('line', function(line){
  
  for (let id in peers) 
    //connection.send(line)
    rl.prompt();
  
}).on('close', function() {

  //for(var i=0;i<counter;i++)
     // peers[counter].connection.write("hello")
//  console.log(peers[i],'\n')
  console.log('Have a great day!');
  process.exit(0);
});
*/



/*for (let id in peers){

  console.log(counter)

}*/

