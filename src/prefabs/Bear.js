class Bear extends Enemy {
    constructor(x, y, target) {
        var key = 'bear';
        var texture = key + '_idle';
        var hurtColor = 0xff0000;
        var colliderRadius = 60;
        var range = 90;
        var health = 20;
        var movementSpeed = 150;
        var moveSound = activeScene.bearMoveSound;
        var hurtSound = activeScene.bearHurtSound;
        var attackSound = activeScene.bearAttackSound;

        super(x, y, texture, colliderRadius, range, health, movementSpeed, target, key, hurtColor, moveSound, hurtSound, attackSound);
        this.lootTable = ['health_potion', 'key'];
        this.dropRate = .2;
    }

    attack() {
        if (!this.isAttacking) {
            // On Attack start
            this.isAttacking = true;
            this.attackSound.play();

            // Set animation
            var duration = 600;
            this.anims.play(this.key + '_attacking', true);

            var attack;
            // Start Attack
            activeScene.time.delayedCall(duration / 4, () => {
                attack = new Attack(activeScene, this, this.direction, 140, 140, 0, 5);
                enemyAttacks.push(attack);
            }, null, activeScene);
            // On Attack stop
            activeScene.time.delayedCall(duration, () => {
                if(this.anims != undefined) {
                    this.anims.play(this.key + '_idle', true);
                }
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