class Level01 extends Phaser.Scene {
    constructor() {
        super("level01Scene");
    }

    preload() {
        this.load.image('player', 'assets/temp_player.png');
        this.load.image('zombie', 'assets/temp_zombie.png');
    }

    create() {
        // Create Entities
        this.player = new Player(this,600,300,'player',40);
        this.enemies = [];
        this.spawnZombie(100,100);

        // Collisions
        this.physics.add.collider(this.player, this.enemies, () => {
            console.log("Hit");
        });
    }

    update() {
        // Update Entities
        this.player.update();
        this.enemies.forEach(e => {
            e.update();
        });
    }

    // Enemy Spawn Functions
    spawnZombie(x, y) {
        this.enemies.push(new Zombie(this, x, y,'zombie',40));
    }
}