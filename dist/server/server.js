const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const { parseCommandLine } = require('typescript');

const port = 3000;

app.use(express.static(path.join(__dirname, '../client')));



// # npm run build        (this creates the production version of bundle.js and places it in ./dist/client/)
// # tsc -p ./src/server  (this compiles ./src/server/server.ts into ./dist/server/server.js)
// # npm start            (this starts nodejs with express and serves the ./dist/client folder)


io.sockets.on('connection',(socket)=>{

    socket.userData = {x:0,y:0,z:0, heading : 0};
    console.log("Player Connected :"+socket.id);
    socket.emit('setId',{id : socket.id}); // Emits this to all the players in the server
    

    socket.on('disconnect',()=>{
        console.log("Player Disconnected :"+socket.id);
        socket.broadcast.emit('deletePlayer',{id : socket.id}); // Emits this objects to other players when socket is disconnected
    })

    socket.on('init',(data) => {           // Sets the socket data at intilization event
        console.log('socket.init :'+data.model);
        socket.userData.model = data.model;
        socket.userData.color = data.color;
        socket.userData.x = data.x;
        socket.userData.y = data.y;
        socket.userData.z = data.z;
        socket.userData.heading = data.h;
        socket.userData.pb = data.pb;
        socket.userData.action = "Idle";
    })

    socket.on('update',(data)=>{           // Sets the socket data at at update event
        socket.userData.x = data.x;
        socket.userData.y = data.y;
        socket.userData.z = data.z;
        socket.userData.heading = data.h;
        socket.userData.pb = data.pb;
        socket.userData.action = data.action;
    })

    socket.on('chat message', function(data){ // Send the message to that player
		console.log(`chat message:${data.id} ${data.message}`);
		io.to(data.id).emit('chat message', { id: socket.id, message: data.message,playername : data.playername });
	})
})




setInterval(function(){
	const nsp = io.of('/');
    let pack = [];

    // console.log();
    io.fetchSockets()
    .then((sockets) => 
    {
    sockets.forEach((socket) => 
        {
            if (socket.userData.model!==undefined){
                //  console.log(socket.id);
                pack.push({
                    id: socket.id,
                    model: socket.userData.model,
                    colour: socket.userData.colour,
                    x: socket.userData.x,
                    y: socket.userData.y,
                    z: socket.userData.z,
                    heading: socket.userData.heading,
                    pb: socket.userData.pb,
                    action: socket.userData.action
                }); 
               
            }
        })
        if (pack.length>0) 
        {
            io.emit('remoteData', pack);
        }
    })
  
}, 40); // 25 frames a second


http.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
})
