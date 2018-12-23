const {fork}=require('child_process')

const forked=fork('mine.js')

var timer1 = setTimeout(() =>{  /*This is demonstration purpose only, this will be an
                                  event listener for incoming mined blocks*/
        forked.kill('SIGINT')
        console.log('Mining stopped due to finished block from some other node.')    
},100)

forked.on('message',(msg)=>{
    clearTimeout(timer1)
    console.log('Mining completed in this node itself')
    console.log(`Mining result: ${msg}`)
})
