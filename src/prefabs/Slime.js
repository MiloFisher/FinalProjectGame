class Slime extends Enemy {
    constructor(x, y, target) {
        var texture = 'slime_idle';
        var colliderRadius = 40;
        var health = 20;
        var movementSpeed = 150;
        var moveSound = activeScene.slimeMoveSound;
        var hurtSound = activeScene.slimeHurtSound;
        var attackSound = activeScene.slimeAttackSound;

        super(x, y, texture, colliderRadius, health, movementSpeed, target, 'slime', 0x00c0f0, moveSound, hurtSound, attackSound);
        this.lootTable = ['health_potion','key'];
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
                duration: duration/2,
                ease: 'Power2',
                yoyo: true,
                delay: 0
            });

            var attack;
            // Start Attack
            activeScene.time.delayedCall(duration/4, () => {
                attack = new Attack(activeScene, this, this.direction, 140, 140, 0, 5);
                enemyAttacks.push(attack);
            }, null, activeScene);
            // On Attack stop
            activeScene.time.delayedCall(duration, () => {
                for (var i = 0; i < enemyAttacks.length; i++) {
                    if (enemyAttacks[i] == attack) {
                        enemyAttacks.splice(i, 1);
                        attack.destroy();
                    }
                }
            }, null, activeScene);
            // Attack cooldown over
            activeScene.time.delayedCall(duration * 2, () => {
                this.isAttacking = false;
            }, null, activeScene);
        }
    }
}