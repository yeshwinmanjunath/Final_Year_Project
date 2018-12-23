
peers ={}
peers[0]="a"
peers[1]="b"


//for extracting both key ,values
    for (let v of Object.entries(peers)) {
       console.log (v[0],v[1])
    }
//for only values
    for (let v of Object.values(peers)) {
        console.log(v); // John, then 30
      }
//for keys
      for (let v of Object.keys(peers)) {
        console.log(v); // John, then 30
      }   