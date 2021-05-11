class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture,) {
        super(scene, x, y, texture);
        // Obstacle Configuration
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.immovable = true;
    }
}