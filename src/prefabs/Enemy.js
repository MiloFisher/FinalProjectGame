class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, colliderRadius, movementSpeed) {
        super(scene, x, y, texture);
        // Enemy Configuration
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCircle(colliderRadius);
        this.movementSpeed = movementSpeed;
        this.body.immovable = true;
    }

    pathfind(_breakoutCondition) {
        
    }
}