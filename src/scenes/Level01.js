class Level01 extends Phaser.Scene {
    constructor() {
        activeSceneKey = "level01Scene";
        super(activeSceneKey);
    }

    preload() {
        this.load.image('player', 'assets/temp_player.png');
        this.load.image('zombie', 'assets/temp_zombie.png');
        this.load.image('pathNode', 'assets/pathNode.png');

        this.load.tilemapTiledJSON('map', 'assets/temp_tilemap.json');
        this.load.image('tiles', 'assets/temp_tilegrid.png');

        this.load.audio('temp_sound', './assets/Meteor.mp3');

        // sprite sheets
        this.load.spritesheet('warrior_walking', './assets/warrior/warrior_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
        this.load.spritesheet('warrior_idle', './assets/warrior/warrior_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
        this.load.spritesheet('rogue_walking', './assets/rogue/rogue_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
        this.load.spritesheet('rogue_idle', './assets/rogue/rogue_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
        this.load.spritesheet('mage_walking', './assets/mage/mage_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
        this.load.spritesheet('mage_idle', './assets/mage/mage_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    }

    create() {
        // Set active scene
        activeScene = this;

        // Save game
        saveGame();

        // Set up level bounds
        this.physics.world.setBounds(0,0,2400,1440);

        // Create tile map
        map = this.make.tilemap({ key: 'map' });
        map.setCollisionByProperty({ walkable: false });
        var tileset = map.addTilesetImage('temp_tilegrid','tiles');
        var layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

        // Generate Path
        generatePathNodes();

        // Animations
        createAnimations();

        // Create Player
        player = new Player(600,380, playerClass + '_walking', 40);
        this.cameras.main.setBounds(0,0,2400,1440);
        this.cameras.main.startFollow(player);

        // Create Entites
        enemies = [];
        spawnZombie(100,100, player);
        spawnZombie(100,500, player);

        // Collisions
        addTriangles();
        this.physics.add.collider(player, layer, () => {}, diagonalCollision);

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.started = true;

        // We have sound, yay!
        this.config = {
            rate: 2,
            volume: .5,
            loop: false
        }
        this.sound = this.sound.add('temp_sound', this.config);
        this.sound.play(this.config);
    }

    update() {
        if(this.started) {
            // Update Entities
            player.update();
            enemies.forEach(e => {
                e.update();
            });
        }
    }
}