const MainMenu = require('./scenes/mainMenu')
const Level = require('./scenes/levelWithArcadePhysics')

config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainMenu, Level]
}

var game = new Phaser.Game(config)

module.exports = game