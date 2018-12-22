var readline = require('readline'),
  rl = readline.createInterface(process.stdin, process.stdout)
 
  
  //initial screen
  console.log( 'Good to see you. Try typing stuff.');
  rl.prompt();
  

//event handling  
rl.on('line', function(line){  //on getting 'line' of input
  console.log('Say what? I might have heard `' + line + '`');
  rl.prompt(); //ask for input
}).on('close', function() { //on event close(ctrl+c)
  console.log('Have a great day!');
  process.exit(0);
});

 
