class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')
    }
    preload() {
        
    }
    create() {
        this.backgroundColor = this.add.rectangle(0, 0, 800, 600, 0x4D4D4D).setOrigin(0, 0)
        this.buttonStart = this.add.text(400, 300, "Best Game of This Year", {
            color: 'white',
            fontSize: 32
        }).setOrigin(Phaser.CENTER, Phaser.CENTER)

        this.buttonStart.setShadow(5, 5, 'red', 3, false, true)

        this.buttonStart.setInteractive()
        this.buttonStart.on('pointerover', () => { this.buttonStart.setColor('blue') })
        this.buttonStart.on('pointerout', () => { this.buttonStart.setColor('white') })
        this.buttonStart.on('pointerdown', () => { this.scene.start('Level') })

        this.input.keyboard.on('keydown-ESC', function (event) {
            this.scene.resume('Level') // Volta com a senha 'Level'
            this.scene.stop() // destroy essa scene
        }, this)

        this.input.keyboard.on('keydown-ENTER', function (event) {
            this.scene.start('Level')
        }, this)
        
    }
}

module.exports = MainMenu