class Projectile extends Attack {
    constructor(scene, caster, direction, width, height, distanceFromCaster, damage, moveSpeed, texture, effect, duration) {
        super(scene, caster, direction, width, height, distanceFromCaster, damage, effect, duration);
        // Projectile Configuration
        switch(direction) {
            case 0: this.h = 0; this.v = -moveSpeed; break;
            case 1: this.h = moveSpeed * diagonalSpeed; this.v = -moveSpeed * diagonalSpeed; break;
            case 2: this.h = moveSpeed; this.v = 0; break;
            case 3: this.h = moveSpeed * diagonalSpeed; this.v = moveSpeed * diagonalSpeed; break;
            case 4: this.h = 0; this.v = moveSpeed; break;
            case 5: this.h = -moveSpeed * diagonalSpeed; this.v = moveSpeed * diagonalSpeed; break;
            case 6: this.h = -moveSpeed; this.v = 0; break;
            case 7: this.h = -moveSpeed * diagonalSpeed; this.v = -moveSpeed * diagonalSpeed; break;
        }
        this.sprite = new Phaser.GameObjects.Sprite(activeScene, this.x, this.y, texture);
        this.sprite.angle = direction * 45;
        activeScene.add.existing(this.sprite);
    }

    update() {
        this.x += this.h;
        this.y += this.v;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
}