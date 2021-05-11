class PathNode extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        // Node Configuration
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.immovable = true;
        this.alpha = 0;
        this.cost = 0;
        this.parent = undefined;
        this.pathLength = 0;
        this.neighbors = [];
    }
}