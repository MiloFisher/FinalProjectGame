class Zombie extends Enemy {
    constructor(scene, x, y, texture, colliderRadius, movementSpeed, target) {
        super(scene, x, y, texture, colliderRadius, movementSpeed, target);
    }

    update() {
        this.pathfind(this.target);
    }
}