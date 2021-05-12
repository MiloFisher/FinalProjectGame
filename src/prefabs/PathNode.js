class PathNode extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture) {
        super(activeScene, x, y, texture);
        // Node Configuration
        activeScene.add.existing(this);
        activeScene.physics.add.existing(this);
        this.body.immovable = true;
        this.alpha = 0;
        this.cost = 0;
        this.parent = undefined;
        this.pathLength = 0;
        this.neighbors = [];
    }
}