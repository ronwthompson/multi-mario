var multimario = {}, titleText, titleText2, playerName = '', letterX = 40, letterY = 56, letterClicks = [], displayName
var delKey, continueKey, frameCount = 0
// A different, fancy way to do this: (honestly, I'd probably just stick with yours)
const alphabet = Array.from({ length: 26 }, (_val, i) => String.fromCharCode(65 + i)).concat('!', '?')

multimario.state0 = function(){}
multimario.state0.prototype = {
    // Each of these functions can be separated out to a different file. (e.g. preload.js, create.js, ...)
    preload: function(){
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
        game.scale.setUserScale(3,3)
        Phaser.Canvas.setImageRenderingCrisp(game.canvas)
        game.load.bitmapFont('marioFont', 'assets/font/marioFont.png', 'assets/font/marioFont.xml')
    },

    create: function(){
        // I know it might seem silly at first but writing variable names for all these magic numbers
        // will really help you in later stages. What is 40? What is 24? They seem super important!
        
        game.stage.backgroundColor = '#212121'
        
        titleText = game.add.bitmapText(40, 24, 'marioFont','ENTER YOUR NAME',8) 
        titleText2 = game.add.bitmapText(40, 32, 'marioFont','(UP TO 6 LETTERS):',8)

        for (let i = 0; i < alphabet.length; i++){
            letterClicks[i] = game.add.bitmapText(letterX, letterY, 'marioFont', alphabet[i], 8)
            letterClicks[i].inputEnabled = true
            letterClicks[i].events.onInputUp.add(addLetter, this)
            if ((i+1) % 6 == 0){
                letterY += 24
                letterX = 40
            } else {
                letterX += 24
            }
        }

        delKey = game.add.bitmapText(letterX, letterY, 'marioFont', 'DEL', 8)
        delKey.inputEnabled = true
        delKey.events.onInputUp.add(delLetter)

        displayName = game.add.bitmapText(80, 176, 'marioFont',playerName,8)

        continueKey = game.add.bitmapText(200, 220, 'marioFont', 'START', 8)
        continueKey.visible = false
    },

    update: function(){
        if (frameCount == 60){
            frameCount = 0
        } else {
            frameCount++
        }
        if (playerName.length > 0){
            continueKey.inputEnabled = true
            continueKey.events.onInputUp.add(startGame)
            continueKey.visible = true
        } else {
            continueKey.inputEnabled = false
            continueKey.visible = false
        }
    }
}

function addLetter(item){
    if (playerName.length < 6){
        playerName += item._text
    }
    displayName.text = playerName
}

function delLetter(){
    playerName = playerName.slice(0, -1)
    displayName.text = playerName
}

function startGame(){
    game.state.start('state1')
}
