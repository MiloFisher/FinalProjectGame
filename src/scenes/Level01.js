class Level01 extends Phaser.Scene {
    constructor() {
        super("level01Scene");
    }

    preload() {
        this.load.image('player', 'assets/temp_player.png');
        this.load.image('zombie', 'assets/temp_zombie.png');
        this.load.image('obstacle', 'assets/temp_obstacle.png');
        this.load.image('pathNode', 'assets/pathNode.png');
    }

    create() {
        // Generate Path
        generatePathNodes(this,80,80,0,0,1200,700);

        // Create Entities
        this.player = new Player(this,600,300,'player',40);
        enemies = [];
        spawnZombie(this,100,100);
        obstacles = [];
        obstacles.push(new Obstacle(this, 300, 300, 'obstacle'));

        // Collisions
        this.physics.add.collider(this.player, enemies, () => {
            console.log("Hit");
        });
        this.physics.add.collider(pathNodes, obstacles, (_pathNode, _obstacle) => {
            _pathNode.body.enable = false;
            for (var i = 0; i < pathNodes.length; i++) {
                if (pathNodes[i] == _pathNode) {
                    pathNodes[i].enable = false;
                    removeFromNeighbors(pathNodes[i]);
                    pathNodes.splice(i, 1);
                    break;
                }
            }
        });

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            enemies[0].pathfind(this.player);
        }

        // Update Entities
        this.player.update();
        enemies.forEach(e => {
            e.update();
        });
    }
}