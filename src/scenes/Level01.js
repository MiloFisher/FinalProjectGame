class Level01 extends Phaser.Scene {
    constructor() {
        super("level01Scene");
    }

    preload() {
        this.load.image('player', 'assets/temp_player.png');
    }

    create() {
        // Create Entities
        this.player = new Player(this,600,300,'player',40);
    }

    update() {
        // Update Entities
        this.player.update();
    }
}