var backs = [12, 13, 14, 15, 45, 46, 47, 113, 273, 274, 275, 306, 307, 309, 310, 311, 661, 662, 663, 694, 695, 696]
var plats = [1, 2, 34, 67, 69, 265, 266, 267, 268, 269, 298, 299, 300, 301, 302]
var qbloc = [25]
var playerGravity = 1200, playerDirection = 'right', playerMaxXVelocity = 100, playerMaxYVelocity = 425, playerAcceleration = 5, jump = true
var jumpKey, fireKey, marioBackTiles, marioPlatTiles, marioQbloTiles, hitPlatform, hitQblocks

multimario.state1 = function(){}
multimario.state1.prototype = {
    preload: function(){
        game.load.tilemap('marioStage', 'assets/one_one.json', null, Phaser.Tilemap.TILED_JSON)
        game.load.image('marioTiles', 'assets/NES - Super Mario Bros - Tileset.png')
        game.load.atlasJSONHash('mario', 'assets/characters/smallMario.png', 'assets/characters/smallMario.json')
        game.load.atlasJSONHash('qblock', 'assets/stage/qblocks.png', 'assets/stage/qblocks.json')
    },

    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE) //enable the Arcade Physics system
        game.renderer.renderSession.roundPixels = true //prevents sprite shake when camera is following
        game.stage.backgroundColor = '#6b8cff'
    
        var map = game.add.tilemap('marioStage')
        map.addTilesetImage('mario', 'marioTiles')

        marioBackTiles = map.createLayer('Background')
        marioPlatTiles = map.createLayer('Platforms')
        marioQbloTiles = map.createLayer('Question Blocks')

        marioPlatTiles.debug = true
        marioQbloTiles.debug = true

        map.setCollision(plats, true, 'Platforms')
        map.setCollision(qbloc, true, 'Question Blocks')

        qblocks = game.add.group() //add question blocks
        qblocks.enableBody = true

        map.createFromObjects('Question Blocks', 25, 'qblock', 0, true, false, qblocks) //convert all static qblocks (tile # 25) to animatable qblocks

        qblocks.callAll('animations.add', 'animations', 'blink', [0, 1, 2, 3], 10, true) //add qblock animations
        qblocks.callAll('animations.play', 'animations', 'blink')

        player = game.add.sprite(100, 100, 'mario', 0) // player and its settings
        player.anchor.setTo(0.5,0.5)
        player.scale.setTo(1,1)
        // player.smoothed = true
        game.physics.arcade.enable(player) //enable physics on the player

        player.body.gravity.y = playerGravity //player physics properties 
        player.body.collideWorldBounds = true

        player.animations.add('left', [1,2,3,2], 12, true) //player animations
        player.animations.add('jump', [5], 1, true)
        player.animations.add('turn', [4], 1, true)

        cursors = game.input.keyboard.createCursorKeys() //game controls

        jumpKey = game.input.keyboard.addKey(88)
        fireKey = game.input.keyboard.addKey(90)
    
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        
        
        game.world.setBounds(0,0,3616,240)
        game.camera.setBoundsToWorld()
        game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1) // making the camera follow the player
        game.camera.deadzone = new Phaser.Rectangle(118, 0, 20, 240); 
    },

    update: function(){
        hitPlatform = game.physics.arcade.collide(player, marioPlatTiles) //collide the player with the platforms
        hitQblocks = game.physics.arcade.collide(player, marioQbloTiles) //collide player with question blocks
        if (player.body.velocity.x > 0 && playerDirection == 'right' && !cursors.right.isDown){ //reset the players velocity when no button is pressed
            player.body.velocity.x -= playerAcceleration
        } else if (player.body.velocity.x < 0 && playerDirection == 'left' && !cursors.left.isDown){
            player.body.velocity.x += playerAcceleration
        } else if (!cursors.right.isDown && !cursors.left.isDown) {
            player.body.velocity.x = 0
        }

        if (cursors.left.isDown){ //move to the left
            if (player.body.velocity.x > 0){
                player.animations.play('turn')
                player.body.velocity.x -= playerAcceleration
            } else if (player.body.velocity.x > -playerMaxXVelocity){
                player.animations.play('left')
                player.body.velocity.x -= playerAcceleration
            } else {
                player.animations.play('left')
                player.body.velocity.x = -playerMaxXVelocity
            }
            player.scale.setTo(-1,1)
            playerDirection = 'left'
        } else if (cursors.right.isDown){ //move to the right
            if (player.body.velocity.x < 0){
                player.animations.play('turn')
                player.body.velocity.x += playerAcceleration
            } else if (player.body.velocity.x < playerMaxXVelocity){
                player.animations.play('left')
                player.body.velocity.x += playerAcceleration
            } else{
                player.animations.play('left')
                player.body.velocity.x = playerMaxXVelocity
            }
            player.scale.setTo(1,1)
            playerDirection = 'right'
        } else{ //stand still
            player.animations.stop()
            player.frame = 0
        }

        if (jumpKey.isDown && player.body.onFloor() && onBlock() && jump){ //allow the player to jump if they are touching the ground
            player.body.velocity.y = -playerMaxYVelocity
            jump = false
        }

        if (!jumpKey.isDown) { 
            if (player.body.velocity.y < 0){ //allow shorter jumps if button is not held
                player.body.velocity.y += 15
            }
            jump = true //prevents jumping by just holding jump button
        }

        if (!player.body.onFloor()){ //jumping animation
            onLadder = false
            player.animations.play('jump')
            player.body.gravity.y = playerGravity
        }
    }
}

function onBlock(){
    return hitPlatform || hitQblocks
}