class Rogue extends Player {
    constructor(x, y, texture, colliderRadius) {
        super(x, y, texture, colliderRadius);

    }

    basicAttack(pointer, gameObject) {
        if (!this.isAttacking) {
            // On Attack start
            if (this.body.velocity.x == 0 && this.body.velocity.y == 0) {
                if (gameObject == undefined) {
                    this.lookAt(activeScene.cameras.main.worldView.x + pointer.x, activeScene.cameras.main.worldView.y + pointer.y);
                } else {
                    this.lookAt(gameObject.x, gameObject.y);
                }
            }
            this.isAttacking = true;
            player.anims.play(playerClass + '_basic', true);
            var duration;
            var attack;
            this.setOffset(0, 40);
            duration = 500;
            attack = new Projectile(activeScene, this, this.direction, 10, 20, 5, 8, 'arrow');
            projectiles.push(attack);
            playerAttacks.push(attack);

            // On Attack stop
            activeScene.time.delayedCall(duration, () => {
                this.isAttacking = false;
            }, null, activeScene);
        }
    }
}