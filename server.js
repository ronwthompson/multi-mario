var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
var port = process.env.PORT || 8081
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const marioRoutes = require('./scores/js/routes')
const coinArray = [
    {x:3448,y:89}, {x:3464,y:89}, {x:3480,y:89}, {x:3496,y:89}, {x:3512,y:89},
    {x:3432, y:121}, {x:3448,y:121}, {x:3464,y:121}, {x:3480,y:121}, {x:3496,y:121}, {x:3512,y:121}, {x:3528,y:121},
    {x:3432, y:153}, {x:3448,y:153}, {x:3464,y:153}, {x:3480,y:153}, {x:3496,y:153}, {x:3512,y:153}, {x:3528,y:153}
    ]
let currentCoins, coinCheck

app.use(cors())
app.use(bodyParser.json())
app.use('/css',express.static(__dirname + '/css'))
app.use('/js',express.static(__dirname + '/js'))
app.use('/assets',express.static(__dirname + '/assets'))
app.use('/scores/js',express.static(__dirname + '/scores/js'))
app.use('/scores/css',express.static(__dirname + '/scores/css'))
app.use('/scores/images',express.static(__dirname + '/scores/images'))

app.use('/highscores', marioRoutes)

app.get('/scores',(req,res) => {
    res.sendFile(__dirname+'/scores/scores.html')
})

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
            socket.player.frame = data.frame
            socket.player.x = data.x
            socket.player.y = data.y
            socket.player.direction = data.direction
            io.emit('move',getAllPlayers()) // sends back to client
        })
        socket.on('collectCoin',function(data){
            coinCheck = data
            let id2remove = currentCoins.findIndex(findCoin)
            currentCoins.splice(id2remove, 1)
            io.emit('coins', currentCoins)
        })
        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id)
        })
    })
})

function findCoin(data){
    return (data.x == coinCheck.x && data.y == coinCheck.y)
}

function getAllPlayers(){
    var players = []
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player
        if(player) players.push(player)
    })
    return players
}

setInterval(() => { //resets coins
    currentCoins = coinArray.slice()
    io.emit('coins', coinArray)
}, 30000)