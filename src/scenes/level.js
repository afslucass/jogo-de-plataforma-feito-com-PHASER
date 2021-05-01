
const Player = require('../resources/spritesheet.png')
const Tiles = require('../resources/tilemap.png')

// O tilemap tem que esta com o tileset imbutido
const MapJson = require('../resources/Map.json')

let habilitarPulo = false
let isPaused = true

class Level extends Phaser.Scene {
    constructor() {
        super({
            key: 'Level',
            physics: {
                default: 'matter',
                matter: {
                    gravity: { y: 0.5 }
                }
            }
        })
    }

    preload() {
        this.load.spritesheet('player', Player, { frameWidth: 572, frameHeight: 572 })
        this.load.image('tiles', Tiles)
        this.load.tilemapTiledJSON('map', MapJson)
    }

    create() {

        var map = this.make.tilemap({ key: 'map', tileWidth: 30, tileHeight: 30 })
        
        var tileset = map.addTilesetImage('Tileset', 'tiles')
         
        var backgroundLayer = map.createDynamicLayer(0, tileset, 0, 0)

        var obstaclesLayer = map.createDynamicLayer(1, tileset, 0, 0)

        backgroundLayer.setCollision([99, 100, 101]);
        // obstaclesLayer.setCollisionBetween(0, 100);
        
        this.player =  this.matter.add.sprite(150, 150, 'player', 1, {
            label: 'Player',
            shape: 'rectangle',
            mass: 1,
            chamfer: {
                radius: 10
            }
        })
            .setScale(0.10, 0.10)
            .setFixedRotation()
        this.anims.create({
            key: 'walking',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 10 }),
            repeat: -1,
            frameRate: 5
        })

        this.player.anims.play('walking')

        this.enemies = []
        for(let i = 0; i < 3; i++)
        {
            this.enemies[i] = this.matter.add.sprite(300+(400*i), 20, 'player', 1, {
                label: 'Enemy',
                shape: 'rectangle',
                mass: 1000,
                chamfer: {
                    radius: 10
                }
            })
                .setTint(0xFF0000)
                .anims.play('walking')
                .setScale(0.1, 0.1)
                .setFixedRotation()
                .flipX = true
        }

        this.matter.world.convertTilemapLayer(backgroundLayer)
        this.matter.world.convertTilemapLayer(obstaclesLayer)

        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
            let pairs = event.pairs;
            habilitarPulo = true
        })
        
        this.cameras.main.setBounds(0, 0, backgroundLayer.width * 2, 600)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

        this.cursors = {}
    }
    
    update() {

        this.cursors.up = this.input.keyboard.addKey('W')
        this.cursors.down = this.input.keyboard.addKey('S')
        this.cursors.right = this.input.keyboard.addKey('D')
        this.cursors.left = this.input.keyboard.addKey('A')
        
        this.cursors.esc = this.input.keyboard.addKey('ESC')
        
        // Implementar um pause
        // Atirar e matar os inimigos
        
        if(this.cursors.left.isDown) {
            this.player.setVelocityX(-3.5)
            this.player.flipX = true
        } else if(this.cursors.right.isDown) {
            this.player.setVelocityX(3.5)
            this.player.flipX = false
        } else {
            this.player.setVelocityX(0)
        }
        
        if(this.cursors.up.isDown && habilitarPulo) {
            this.player.setPosition(this.player.x, 0)
            habilitarPulo = false
        }

        if(!isPaused) 
        {
            this.matter.world.pause()
        } else
        {
            this.matter.world.resume()
        }
    }
}

module.exports = Level