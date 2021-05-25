class Necromancer extends Player {
    constructor(x, y, texture, colliderRadius) {
        super(x, y, texture, colliderRadius);

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
            var duration;
            var attack;
            duration = 500;
            attack = new Attack(activeScene, this, this.direction, 40, 80, 5);
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