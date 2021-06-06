class Wisp extends Enemy {
    constructor(x, y, target) {
        var key = 'wisp';
        var texture = key + '_idle';
        var hurtColor = 0x00ff00;
        var colliderRadius = 40;
        var range = 110;
        var health = 20;
        var movementSpeed = 150;
        var moveSound = activeScene.wispMoveSound;
        var hurtSound = activeScene.wispHurtSound;
        var attackSound = activeScene.wispAttackSound;

        super(x, y, texture, colliderRadius, range, health, movementSpeed, target, key, hurtColor, moveSound, hurtSound, attackSound);
        this.lootTable = ['health_potion', 'key', playerClass + '_weapon', playerClass + '_armor'];
        this.dropRate = .2;
    }

    attack() {
        if (!this.isAttacking) {
            // On Attack start
            this.isAttacking = true;
            this.attackSound.play();

            // Set animation
            var duration = 600;
            activeScene.tweens.add({
                targets: this,
                scaleX: 1.75,
                scaleY: 1.75,
                duration: duration / 2,
                ease: 'Power2',
                yoyo: true,
                delay: 0
            });

            var attack;
            // Start Attack
            activeScene.time.delayedCall(duration / 4, () => {
                attack = new Projectile(activeScene, this, this.direction, 11, 30, 0, 5, 6, 'wispshot');
                enemyAttacks.push(attack);
                projectiles.push(attack);
            }, null, activeScene);
            // Attack cooldown over
            activeScene.time.delayedCall(duration * 2, () => {
                this.isAttacking = false;
            }, null, activeScene);
        }
    }
}