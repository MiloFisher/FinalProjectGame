class Zombie extends Enemy {
    constructor(x, y, texture, colliderRadius, movementSpeed, target) {
        super(x, y, texture, colliderRadius, movementSpeed, target, 'zombie');
    }

    update() {
        this.pathfind(this.target);
        
    }
}