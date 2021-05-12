class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture,) {
        super(activeScene, x, y, texture);
        // Obstacle Configuration
        activeScene.add.existing(this);
        activeScene.physics.add.existing(this);
        this.body.immovable = true;
    }
}