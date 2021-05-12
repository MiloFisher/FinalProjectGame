class Zombie extends Enemy {
    constructor(x, y, texture, colliderRadius, movementSpeed, target) {
        super(x, y, texture, colliderRadius, movementSpeed, target);
    }

    update() {
        this.pathfind(this.target);
        
    }
}