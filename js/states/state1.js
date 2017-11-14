var backs = [12, 13, 14, 15, 45, 46, 47, 113, 273, 274, 275, 306, 307, 309, 310, 311, 661, 662, 663, 694, 695, 696]
var plats = [1, 2, 34, 67, 69, 265, 266, 267, 268, 269, 298, 299, 300, 301, 302]
var qbloc = [25]
var playerGravity = 1200, playerDirection = 'right', playerMaxXVelocity = 80, playerMaxYVelocity = 425, playerAcceleration = 5, jump = true
var jumpKey, fireKey, marioBackTiles, marioPlatTiles, marioQbloTiles, hitPlatform, hitQblocks, currentPlayer, currentPlayerId, scoreText
var marioText, worldText1, worldText2, currentPlayerScore, overworldMusic, underworldMusic, jumpFX

multimario.state1 = function(){}
multimario.state1.prototype = {
    preload: function(){
        game.load.tilemap('marioStage', 'assets/one_one.json', null, Phaser.Tilemap.TILED_JSON)
        game.load.image('marioTiles', 'assets/NES - Super Mario Bros - Tileset.png')
        game.load.atlasJSONHash('mario', 'assets/characters/smallMario.png', 'assets/characters/smallMario.json')
        game.load.atlasJSONHash('qblock', 'assets/stage/qblocks.png', 'assets/stage/qblocks.json')
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
        game.scale.setUserScale(3,3)
        game.renderer.renderSession.roundPixels = true //prevents sprite shake when camera is following
        Phaser.Canvas.setImageRenderingCrisp(game.canvas)
        game.load.bitmapFont('marioFont', 'assets/font/marioFont.png', 'assets/font/marioFont.xml')
        game.load.audio('overworld', 'assets/music/overworld.ogg')
        game.load.audio('underworld', 'assets/music/underworld.ogg')
        game.load.audio('jump','assets/fx/smb_jump-small.wav')
    },

    create: function(){
        multimario.state1.playerMap = {}
        game.physics.startSystem(Phaser.Physics.ARCADE) //enable the Arcade Physics system
        game.stage.backgroundColor = '#6b8cff'
    
        var map = game.add.tilemap('marioStage')
        map.addTilesetImage('mario', 'marioTiles')

        marioBackTiles = map.createLayer('Background')
        marioPlatTiles = map.createLayer('Platforms')
        marioQbloTiles = map.createLayer('Question Blocks')

        // marioPlatTiles.debug = true
        // marioQbloTiles.debug = true

        map.setCollision(plats, true, 'Platforms')
        map.setCollision(qbloc, true, 'Question Blocks')

        Client.askNewPlayer()

        qblocks = game.add.group() //add question blocks
        qblocks.enableBody = true

        map.createFromObjects('Question Blocks', 25, 'qblock', 0, true, false, qblocks) //convert all static qblocks (tile # 25) to animatable qblocks

        qblocks.callAll('animations.add', 'animations', 'blink', [0, 1, 2, 3], 10, true) //add qblock animations
        qblocks.callAll('animations.play', 'animations', 'blink')

        cursors = game.input.keyboard.createCursorKeys() //game controls

        jumpKey = game.input.keyboard.addKey(88)
        fireKey = game.input.keyboard.addKey(90)
        
        game.world.setBounds(0,0,3616,260)
        game.camera.bounds = new Phaser.Rectangle(0,0,3616,240) //end of stage is 3360, 3616 includes underground
        game.camera.deadzone = new Phaser.Rectangle(118,0,20,240)

        marioText = game.add.bitmapText(24, 8, 'marioFont','MARIO',8)
        scoreText = game.add.bitmapText(24, 16, 'marioFont','000000',8)
        worldText1 = game.add.bitmapText(152, 8, 'marioFont','WORLD',8)
        worldText2 = game.add.bitmapText(160, 16, 'marioFont','1-1',8)

        marioText.fixedToCamera = true
        scoreText.fixedToCamera = true
        worldText1.fixedToCamera = true
        worldText2.fixedToCamera = true

        overworldMusic = game.add.audio('overworld')
        underworldMusic = game.add.audio('underworld')

        jumpFX = game.add.audio('jump')

        overworldMusic.play()
    },

    update: function(){
        for (var player in multimario.state1.playerMap){
            hitPlatform = game.physics.arcade.collide(multimario.state1.playerMap[player], marioPlatTiles) //collide the player with the platforms
            hitQblocks = game.physics.arcade.collide(multimario.state1.playerMap[player], marioQbloTiles) //collide player with question blocks
        }
        if (currentPlayer){
            multimario.state1.movement()

            if (currentPlayer.body.velocity.x > 0 && playerDirection == 'right' && !cursors.right.isDown){ //reset the players velocity when no button is pressed
                currentPlayer.body.velocity.x -= playerAcceleration
            } else if (currentPlayer.body.velocity.x < 0 && playerDirection == 'left' && !cursors.left.isDown){
                currentPlayer.body.velocity.x += playerAcceleration
            } else if (!cursors.right.isDown && !cursors.left.isDown) {
                currentPlayer.body.velocity.x = 0
            }

            if (cursors.left.isDown){ //move to the left
                if (currentPlayer.body.velocity.x > 0){
                    currentPlayer.animations.play('turn')
                    currentPlayer.body.velocity.x -= playerAcceleration
                } else if (currentPlayer.body.velocity.x > -playerMaxXVelocity){
                    currentPlayer.animations.play('left')
                    currentPlayer.body.velocity.x -= playerAcceleration
                } else {
                    currentPlayer.animations.play('left')
                    currentPlayer.body.velocity.x = -playerMaxXVelocity
                }
                currentPlayer.scale.setTo(-1,1)
                playerDirection = 'left'
            } else if (cursors.right.isDown){ //move to the right
                if (currentPlayer.body.velocity.x < 0){
                    currentPlayer.animations.play('turn')
                    currentPlayer.body.velocity.x += playerAcceleration
                } else if (currentPlayer.body.velocity.x < playerMaxXVelocity){
                    currentPlayer.animations.play('left')
                    currentPlayer.body.velocity.x += playerAcceleration
                } else{
                    currentPlayer.animations.play('left')
                    currentPlayer.body.velocity.x = playerMaxXVelocity
                }
                currentPlayer.scale.setTo(1,1)
                playerDirection = 'right'
            } else{ //stand still
                currentPlayer.animations.stop()
                currentPlayer.frame = 0
            }

            if (jumpKey.isDown && currentPlayer.body.onFloor() && onBlock() && jump){ //allow the player to jump if they are touching the ground
                currentPlayer.body.velocity.y = -playerMaxYVelocity
                jump = false
                jumpFX.play()
            }

            if (!jumpKey.isDown) { 
                if (currentPlayer.body.velocity.y < 0){ //allow shorter jumps if button is not held
                    currentPlayer.body.velocity.y += 15
                }
                jump = true //prevents jumping by just holding jump button
            }

            if (fireKey.isDown) { //if player is holding down z, they can run faster
                playerMaxXVelocity = 140
            } else {
                playerMaxXVelocity = 80
            }

            if (!currentPlayer.body.onFloor()){ //jumping animation
                onLadder = false
                currentPlayer.animations.play('jump')
                currentPlayer.body.gravity.y = playerGravity
            }

            if (currentPlayer.position.y > 240){ //if player falls in a pit, they die
                currentPlayer.kill()
                game.camera.x = 0
                currentPlayer.reset(100,100)
            }

            if (cursors.down.isDown && currentPlayer.position.y == 136 && currentPlayer.position.x > 905 && currentPlayer.position.x < 920){ //allows player to travel to underground
                overworldMusic.stop()
                underworldMusic.play()
                game.camera.x = 3616
                game.camera.follow(null)
                currentPlayer.reset(3400,8)
            }

            if (cursors.right.isDown && currentPlayer.position.y == 200 && currentPlayer.position.x > 3562){ //allows player to leave the underground
                underworldMusic.stop()
                overworldMusic.play()
                game.camera.x = 2472
                currentPlayer.reset(2592,168)
                game.camera.follow(currentPlayer, Phaser.Camera.FOLLOW_LOCKON, 0.3, 0.3)
            }

            if (currentPlayer.position.y == 200 && currentPlayer.position.x > 3235 && currentPlayer.position.x < 3248){ //resets player to beginning if they reach castle
                game.camera.x = 0
                currentPlayer.reset(100,100)
            }
        }
    },
    render: function(){
    }
}

function onBlock(){
    return hitPlatform || hitQblocks
}

multimario.state1.init = function() {
    game.stage.disableVisibilityChange = true
}

multimario.state1.addNewPlayer = function(id,x,y){
    multimario.state1.playerMap[id] = game.add.sprite(x,y,'mario')
    multimario.state1.playerMap[id].anchor.setTo(0.5,0.5)
    multimario.state1.playerMap[id].scale.setTo(1,1)
    game.physics.arcade.enable(multimario.state1.playerMap[id]) //enable physics on the player

    multimario.state1.playerMap[id].body.gravity.y = playerGravity //player physics properties 
    multimario.state1.playerMap[id].body.collideWorldBounds = true

    multimario.state1.playerMap[id].animations.add('left', [1,2,3,2], 12, true) //player animations
    multimario.state1.playerMap[id].animations.add('jump', [5], 1, true)
    multimario.state1.playerMap[id].animations.add('turn', [4], 1, true)

    if (!currentPlayer){
        console.log('set current player to id: '+id)
        currentPlayer = multimario.state1.playerMap[id]
        game.camera.follow(currentPlayer, Phaser.Camera.FOLLOW_LOCKON, 0.3, 0.3)
        currentPlayerId = id
        currentPlayerScore = 0
    }
}

multimario.state1.movement = function(){
    Client.movement(currentPlayerId, currentPlayer.animations.currentAnim.currentFrame.index, currentPlayer.position.x, currentPlayer.position.y, playerDirection) //sends data to client file, movement function
}

multimario.state1.movePlayer = function(data){ //gets from client
    for(let i = 0; i < data.length; i++){
        if (data[i].id != currentPlayerId){
            multimario.state1.playerMap[data[i].id].position.x = data[i].x
            multimario.state1.playerMap[data[i].id].position.y = data[i].y
            multimario.state1.playerMap[data[i].id].frame = data[i].frame
            if (data[i].direction == 'left'){
                multimario.state1.playerMap[data[i].id].scale.setTo(-1,1)
            } else{
                multimario.state1.playerMap[data[i].id].scale.setTo(1,1)
            }
        }
    }
}

multimario.state1.removePlayer = function(id){
    multimario.state1.playerMap[id].destroy();
    delete multimario.state1.playerMap[id];
};