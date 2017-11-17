var Client = {}
Client.socket = io.connect()

Client.askNewPlayer = function() {
    Client.socket.emit('newplayer') //can add second argument to pass data
}

Client.socket.on('newplayer',function(data){
    multimario.state1.addNewPlayer(data.id,data.x,data.y)
})

Client.socket.on('allplayers',function(data){
    for(var i = data.length-1; i >= 0; i--){
        multimario.state1.addNewPlayer(data[i].id,data[i].x,data[i].y)
    }

    Client.movement = function(id,frame,x,y, direction){ //gets called from phaser, sends to server
        Client.socket.emit('cursor',{id:id,frame:frame,x:x,y:y,direction:direction}) 
    }

    Client.collect = function(x,y){ //phaser telling when coins collected, send location of collected coin to server
        Client.socket.emit('collectCoin', {x:x, y:y})
    }

    Client.socket.on('move',function(allData){ //gets from server, sends to phaser
        multimario.state1.movePlayer(allData)
    })

    Client.socket.on('remove',function(id){
        multimario.state1.removePlayer(id)
    })
})

Client.socket.on('coins',function(array){
    multimario.state1.refreshCoins(array)
})