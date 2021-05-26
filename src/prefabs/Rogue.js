class Rogue extends Player {
    constructor(x, y, texture, colliderRadius, health) {
        super(x, y, texture, colliderRadius, health);

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
            this.clearTint();
            player.anims.play(playerClass + '_basic', true);
            this.setOffset(0, 40);

            var duration = 500;
            var attack = new Projectile(activeScene, this, this.direction, 10, 20, 20, 5, 8, 'arrow');
            projectiles.push(attack);
            playerAttacks.push(attack);

            // On Attack stop
            activeScene.time.delayedCall(duration, () => {
                this.isAttacking = false;
            }, null, activeScene);
        }
    }
}