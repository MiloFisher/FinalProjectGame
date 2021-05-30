class Zombie extends Enemy {
    constructor(x, y, texture, colliderRadius, health, movementSpeed, target) {
        super(x, y, texture, colliderRadius, health, movementSpeed, target, 'zombie', 0xf00000);
    }
}