class Slime extends Enemy {
    constructor(x, y, target, tutorialMob) {
        var key = 'slime';
        var texture = key + '_idle';
        var hurtColor = 0x00c0f0;
        var colliderRadius = 40;
        var range = 90;
        var health = 15;
        var movementSpeed = 120;
        var xp = 10;
        var moveSound = activeScene.slimeMoveSound;
        var hurtSound = activeScene.slimeHurtSound;
        var attackSound = activeScene.slimeAttackSound;

        super(x, y, texture, colliderRadius, range, health, movementSpeed, xp, target, key, hurtColor, moveSound, hurtSound, attackSound);
        this.lootTable = ['health_potion', 'key', 'coin', playerClass + '_weapon', playerClass + '_armor'];
        if(tutorialMob) {
            this.dropRate = 0;
        } else {
            this.dropRate = .2;
        }
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
                attack = new Attack(activeScene, this, this.direction, 140, 140, 0, 1);
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