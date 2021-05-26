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
            this.clearTint();
            player.anims.play(playerClass + '_basic', true);
            this.setVelocity(0, 0);
            this.setOffset(0, 80);
            this.lockMovement = true;
            var duration = 250;
            var attack = new Attack(activeScene, this, this.direction, 40, 80, 80, 5);
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

    ability0(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown0) {
            // On Attack start
            if(pointer != undefined) {
                if (gameObject == undefined) {
                    this.lookAt(activeScene.cameras.main.worldView.x + pointer.x, activeScene.cameras.main.worldView.y + pointer.y);
                } else {
                    this.lookAt(gameObject.x, gameObject.y);
                }
            }
            this.isAttacking = true;
            this.cooldown0 = true;
            this.clearTint();
            player.anims.play(playerClass + '_ground_slam', true);
            this.setVelocity(0, 0);
            this.setOffset(40, 40);
            this.lockMovement = true;
            var duration = 750;
            var cooldown = 3000;
            var attack = new Attack(activeScene, this, this.direction, 130, 130, 20, 5);
            playerAttacks.push(attack);

            var cooldownSquare = activeScene.add.rectangle(hudIcons[2].x, hudIcons[2].y, hudIcons[2].width * hudScale, hudIcons[2].height * hudScale, 0xffffff, .5).setScrollFactor(0);
            activeScene.tweens.add({
                targets: cooldownSquare,
                y: hudIcons[2].x + hudIcons[2].height * hudScale * 2.15,
                scaleY: 0,
                duration: cooldown,
                delay: 0
            });

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

            // On Cooldown over
            activeScene.time.delayedCall(cooldown, () => {
                this.cooldown0 = false;
                cooldownSquare.destroy();
            }, null, activeScene);
        }
    }

    ability0DisplayHitArea() {
        var radius = 65;
        var distanceFromCaster = 20;
        return this.displayHitAreaCircle(radius,distanceFromCaster);
    }

    ability0Type() {
        return 'single_use';
    }
}