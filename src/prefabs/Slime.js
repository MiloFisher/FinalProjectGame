class Slime extends Enemy {
    constructor(x, y, texture, colliderRadius, health, movementSpeed, target) {
        super(x, y, texture, colliderRadius, health, movementSpeed, target, 'slime', 0x00c0f0);
    }

    update() {
        this.pathfind(this.target);

    }
}