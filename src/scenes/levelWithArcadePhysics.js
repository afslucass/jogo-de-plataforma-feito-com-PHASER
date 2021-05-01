
const Player = require('../resources/spritesheet.png')
const Tiles = require('../resources/tilemap.png')

// O tilemap tem que esta com o tileset imbutido, Nao da para editar o box collider com o arcade physics, so com o matter.
// Coloque uma aropriedade personalisada, 'collides: true' nos tiles que vao ter a colisao
const MapJson = require('../resources/Map.json')

var isDown = false

class Level extends Phaser.Scene {
    constructor() {
        super({
            key: 'Level',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 }
                }
            }
        })
    }

    DestroyBulletsWhenCollides(colides1, colides2) {
        this.bullets.killAndHide(colides1)
    }

    // Implantar sistema de 5 vidas do inimigo
    DestroyBulletsWhenCollidesWithEnemies(colides1, colides2) {
        this.bullets.killAndHide(colides1)
        colides1.destroy()

        colides2.setData('life', colides2.getData('life') - 1)
        if(colides2.getData('life') < 1) {
            this.enemies.killAndHide(colides2)
            colides2.destroy()
        }
    }

    preload() {
        this.load.spritesheet('player', Player, { frameWidth: 572, frameHeight: 572 })
        this.load.image('tiles', Tiles)
        this.load.tilemapTiledJSON('map', MapJson)
    }

    create() {

        this.map = this.make.tilemap({ key: 'map', tileWidth: 30, tileHeight: 30 })
        
        this.tileset = this.map.addTilesetImage('Tileset', 'tiles')
         
        this.backgroundLayer = this.map.createStaticLayer(0, this.tileset, 0, 0)

        this.obstaclesLayer = this.map.createStaticLayer(1, this.tileset, 0, 0)

        this.backgroundLayer.setCollisionByProperty({ collides: true })
        this.obstaclesLayer.setCollisionByProperty({ collides: true })

        this.player =  this.physics.add.sprite(150, 150, 'player', 1)
        this.player.setScale(0.1, 0.1).refreshBody()
        this.player.body.setAllowRotation(false)

        this.anims.create({
            key: 'walking',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 10 }),
            repeat: -1,
            frameRate: 5
        })

        this.player.anims.play('walking')

        this.bullets = this.add.group()

        this.enemies = this.physics.add.group({
            key: 'player',
            setXY: { x: 300, y: 20, stepX: 400 },
            repeat: 2,
        })
        this.enemies.children.iterate((child) => {
            child.setScale(0.1, 0.1)
            child.refreshBody()
            
            child.setTint(0xFF0000)
            child.anims.play('walking')
            child.body.setDragX(300)
            child.body.setAllowRotation(false)
            child.flipX = true
            child.setData('life', 5)

            this.physics.add.collider(this.backgroundLayer, child, null, null, this) // Reprtei um bug, temos q adicionar um collider dentro do loop
            this.physics.add.collider(this.obstaclesLayer, child, null, null, this)
            this.physics.add.collider(child, child, null, null, this)
            this.physics.add.collider(this.player, child, null, null, this)
            this.physics.add.collider(this.bullets, child, this.DestroyBulletsWhenCollidesWithEnemies, null, this)
        })

        this.physics.add.collider(this.backgroundLayer, this.player, null, null, this)
        this.physics.add.collider(this.obstaclesLayer, this.player, null, null, this)

        this.physics.add.collider(this.bullets, this.backgroundLayer, this.DestroyBulletsWhenCollides, null, this)
        this.physics.add.collider(this.bullets, this.obstaclesLayer, this.DestroyBulletsWhenCollides, null, this)
        this.physics.add.collider(this.bullets, this.enemies, this.DestroyBulletsWhenCollidesWithEnemies, null, this)
        
        this.physics.add.collider(this.backgroundLayer, this.enemies, null, null, this) // e um collider fora do loop q tratam das mesmas colisoes
        this.physics.add.collider(this.obstaclesLayer, this.enemies, null, null, this)
        this.physics.add.collider(this.enemies, this.enemies, null, null, this)
        this.physics.add.collider(this.player, this.enemies, null, null, this)

        this.cameras.main.setBounds(0, 0, this.backgroundLayer.width * 2, 600)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

        this.cursors = {}
        this.cursors.esc = this.input.keyboard.addKey('ESC')

        // No phaser ao pausar uma scene, o update loop tbm é pausado, sendo assim precisamos de duas scenes para fazer o pause/resume

        this.cursors.esc.on('down', function (event) {
            this.scene.moveAbove('Level', 'MainMenu') // Como a scene 'Level' esta na frente, precisamos mudar a posicao para a 'MainMenu' aparecer 
            this.scene.launch('MainMenu') // Roda a 'MainMenu' paralelamente
            this.scene.pause() // Pausa essa scene
        }, this)
    }
    
    update() {

        this.cursors.up = this.input.keyboard.addKey('W')
        this.cursors.down = this.input.keyboard.addKey('S')
        this.cursors.right = this.input.keyboard.addKey('D')
        this.cursors.left = this.input.keyboard.addKey('A')
        this.cursors.space = this.input.keyboard.addKey('SPACE')

        // Atirar e matar os inimigos
        // https://phaser.io/examples/v3/view/physics/arcade/bullets-group
        
        if(this.cursors.left.isDown) {
            this.player.setVelocityX(-200)
            this.player.flipX = true
        } else if(this.cursors.right.isDown) {
            this.player.setVelocityX(200)
            this.player.flipX = false
        } else {
            this.player.setVelocityX(0)
        }
        
        if(this.cursors.up.isDown && ( this.player.body.touching.down || this.player.body.onFloor() )) {
            this.player.setVelocityY(-300)
        }

        if(this.cursors.space.isDown && isDown == false) {
            this.rectTemp = this.add.rectangle(this.player.x, this.player.y, 10, 5, 0xFFF, 1)
            this.rect = this.physics.add.existing(this.rectTemp)
            this.rect.body.setAllowGravity(false)

            if(this.player.flipX == false) {
                this.rect.body.setVelocityX(300)
            } else {
                this.rect.body.setVelocityX(-300)
            }

            this.bullets.add(this.rect)

            isDown = true
        }

        if(this.cursors.space.isUp && isDown == true) {
            isDown = false
        }

        this.bullets.children.iterate((child, index) => {
            if((child.body.x > 5000 || child.body.x < -5000)) {
                this.bullets.killAndHide(child)
            }
        })

    }
}

module.exports = Level