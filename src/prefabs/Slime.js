class Slime extends Enemy {
    constructor(x, y, texture, colliderRadius, movementSpeed, target) {
        super(x, y, texture, colliderRadius, movementSpeed, target, 'slime');
    }

    update() {
        this.pathfind(this.target);

    }
}