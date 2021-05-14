class Level01 extends Phaser.Scene {
    constructor() {
        super("level01Scene");
    }

    preload() {
        this.load.image('player', 'assets/temp_player.png');
        this.load.image('zombie', 'assets/temp_zombie.png');
        this.load.image('obstacle', 'assets/temp_obstacle.png');
        this.load.image('pathNode', 'assets/pathNode.png');

        this.load.tilemapTiledJSON('map', 'assets/temp_tilemap.json');
        this.load.image('tiles', 'assets/temp_tilegrid.png');
    }

    create() {
        // Set active scene
        activeScene = this;
        this.physics.world.setBounds(0,0,2400,1440);

        // Create tile map
        map = this.make.tilemap({ key: 'map' });
        map.setCollisionByProperty({ walkable: false });
        var tileset = map.addTilesetImage('temp_tilegrid','tiles');
        var layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

        // Generate Path
        generatePathNodes();

        // Create Player
        this.player = new Player(600,380,'player',40);
        this.cameras.main.setBounds(0,0,2400,1440);
        this.cameras.main.startFollow(this.player);

        // Create Entites
        enemies = [];
        spawnZombie(100,100,this.player);
        spawnZombie(100,500, this.player);
        obstacles = [];
        //obstacles.push(new Obstacle(300, 300, 'obstacle'));

        // Collisions
        this.physics.add.collider(this.player, obstacles);
        this.physics.add.collider(this.player, layer);

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.started = true;
    }

    update() {
        if(this.started) {
            // Update Entities
            this.player.update();
            enemies.forEach(e => {
                e.update();
            });
        }
    }
}