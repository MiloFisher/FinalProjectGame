class Warrior extends Player {
    constructor(x, y, texture, colliderRadius, health) {
        super(x, y, texture, colliderRadius, health);

    }

    basicAttack(pointer, gameObject) {
        if (!this.isAttacking) {
            // On Attack start
            if (gameObject == undefined) {
                this.lookAt(activeScene.cameras.main.worldView.x + pointer.x, activeScene.cameras.main.worldView.y + pointer.y);
            } else {
                this.lookAt(gameObject.x, gameObject.y);
            }
            this.isAttacking = true;
            player.anims.play(playerClass + '_basic', true);
            this.setVelocity(0, 0);
            this.setOffset(0, 80);
            this.lockMovement = true;
            var duration = 250;
            var attack = new Attack(activeScene, this, this.direction, 40, 80, 5);
            playerAttacks.push(attack);

            // On Attack stop
            activeScene.time.delayedCall(duration, () => {
                this.isAttacking = false;
                this.lockMovement = false;
                for (var i = 0; i < playerAttacks.length; i++) {
                    if (playerAttacks[i] == attack) {
                        playerAttacks.splice(i, 1);
                        attack.destroy();
                    }
                }
            }, null, activeScene);
        }
    }
}