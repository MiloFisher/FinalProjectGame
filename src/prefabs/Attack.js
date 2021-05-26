class Attack extends Phaser.GameObjects.Rectangle {
    constructor(scene, caster, direction, width, height, distanceFromCaster, damage) {
        var distX = 0;
        var distY = 0;
        switch (direction) {
            case 0: distX = 0; distY = -distanceFromCaster; break;
            case 1: distX = Math.sqrt(2) / 2 * distanceFromCaster; distY = Math.sqrt(2) / 2 * -distanceFromCaster; break;
            case 2: distX = distanceFromCaster; distY = 0; break;
            case 3: distX = Math.sqrt(2) / 2 * distanceFromCaster; distY = Math.sqrt(2) / 2 * distanceFromCaster; break;
            case 4: distX = 0; distY = distanceFromCaster; break;
            case 5: distX = Math.sqrt(2) / 2 * -distanceFromCaster; distY = Math.sqrt(2) / 2 * distanceFromCaster; break;
            case 6: distX = -distanceFromCaster; distY = 0; break;
            case 7: distX = Math.sqrt(2) / 2 * -distanceFromCaster; distY = Math.sqrt(2) / 2 * -distanceFromCaster; break;
        }
        var x = caster.x + distX;
        var y = caster.y + distY;
        var a = 0;
        if(enableHitboxes) {
            a = .5;
        }
        super(scene, x, y, width, height, 0xff0000, a);
        // Attack Configuration
        activeScene.add.existing(this);
        this.angle = direction * 45;
        this.damage = damage;
        if(caster == player) {
            this.targets = enemies.slice(0);
        } else {
            this.targets = [ player ];
        }
    }
}