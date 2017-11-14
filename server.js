var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
var port = process.env.PORT || 80

app.use('/css',express.static(__dirname + '/css'))
app.use('/js',express.static(__dirname + '/js'))
app.use('/assets',express.static(__dirname + '/assets'))

app.get('/',(req,res) => {
    res.sendFile(__dirname+'/index.html')
})

server.listen(port,() => { // Listens to port
    console.log('Listening on '+server.address().port);
})

server.lastPlayderID = 0; // Keep track of the last id assigned to a new player

io.on('connection',function(socket){
    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayderID++,
            frame: 0,
            x: 100,
            y: 100
        }
        socket.emit('allplayers',getAllPlayers())
        socket.broadcast.emit('newplayer',socket.player)
        socket.on('cursor',function(data){ //receives data from client, processes
            console.log('click to '+data.x+', '+data.y)
            socket.player.frame = data.frame
            socket.player.x = data.x
            socket.player.y = data.y
            socket.player.direction = data.direction
            io.emit('move',getAllPlayers()) // sends back to client
        })

        socket.on('disconnect',function(){
            console.log('player disconnected')
            io.emit('remove',socket.player.id);
        });
    })

    
})

function getAllPlayers(){
    var players = []
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player
        if(player) players.push(player)
    })
    return players
}