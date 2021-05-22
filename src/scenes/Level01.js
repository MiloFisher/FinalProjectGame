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

        this.load.audio('walk', './assets/Running.mp3');

        // sprite sheets
        loadGenericSpritesheets(this);
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

        // Sound
        createSounds();

        // Create Player
        player = new Player(600,380, playerClass + '_idle', 40);
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