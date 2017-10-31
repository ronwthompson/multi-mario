var game = new Phaser.Game(256, 240, Phaser.AUTO, null, null, null, false)
game.state.add('state0', multimario.state0)
game.state.add('state1', multimario.state1)
game.state.start('state1')