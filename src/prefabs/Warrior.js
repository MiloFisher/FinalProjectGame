class Warrior extends Player {
    constructor(x, y, texture, colliderRadius, health) {
        super(x, y, texture, colliderRadius, health);
        this.charging = false;
        this.chargeCollision;
        this.chargeTargets;
    }

    classSpecial() {
        if(this.charging) {
            player.anims.play(playerClass + '_charge', true);
        }
    }

    basicAttack(pointer, gameObject) {
        if (!this.isAttacking) {
            // Set attack variables
            var duration = 250;
            var damage = 5;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.basicOffset();

            // Play attack animation
            player.anims.play(playerClass + '_basic', true);

            // Create Attack object
            var attack = new Attack(activeScene, this, this.direction, 25, 80, 80, damage);
            playerAttacks.push(attack);

            // End attack
            this.endAttack(attack, duration)
        }
    }
    basicOffset() {
        this.setOffset(0,80);
    }

    // GROUND SLAM - WARRIOR ABILITY 0
    ability0(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown0) {
            // Set attack variables
            var duration = 750;
            var cooldown = 3000;
            var damage = 5;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.ability0Offset();
            this.setCooldown(cooldown, 0);

            // Play attack animation
            player.anims.play(playerClass + '_ground_slam', true);

            // Create Attack object
            var attack = new Attack(activeScene, this, this.direction, 130, 130, 20, damage);
            playerAttacks.push(attack);

            // End attack
            this.endAttack(attack, duration);
        }
    }
    ability0Offset() {
        this.setOffset(40, 40);
    }
    ability0DisplayHitArea() {
        var radius = 65;
        var distanceFromCaster = 20;
        return this.displayHitAreaCircle(radius,distanceFromCaster);
    }
    ability0Type() {
        return 'single_use';
    }

    // CHARGE - WARRIOR ABILITY 1
    ability1(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown1) {
            // Set attack variables
            var duration = 750;
            var cooldown = 3000;
            var damage = 5;
            var chargeSpeed = 700;

            // Call helper functions
            this.setupAttack(pointer,gameObject,true);
            this.ability1Offset();
            this.setCooldown(cooldown, 1);

            // Play attack animation
            player.anims.play(playerClass + '_charge', true);
           
            // Create Attack object
            this.charging = true;
            this.invincible = true;
            var h, v;
            switch (this.direction) {
                case 0: h = 0; v = -1; break;
                case 1: h = 1; v = -1; break;
                case 2: h = 1; v = 0; break;
                case 3: h = 1; v = 1; break;
                case 4: h = 0; v = 1; break;
                case 5: h = -1; v = 1; break;
                case 6: h = -1; v = 0; break;
                case 7: h = -1; v = -1; break;
            }
            if (v == 0 || h == 0) {
                this.setVelocity(chargeSpeed * h, chargeSpeed * v);
            } else {
                this.setVelocity(chargeSpeed * h * diagonalSpeed, chargeSpeed * v * diagonalSpeed);
            }
            this.chargeTargets = enemies.slice(0);
            this.chargeCollision = activeScene.physics.add.overlap(player, this.chargeTargets, (_player, _enemy) => { 
                _enemy.takeDamage(damage);
                for (var i = 0; i < this.chargeTargets.length; i++) {
                    if (this.chargeTargets[i] == _enemy) {
                        this.chargeTargets.splice(i, 1);
                        break;
                    }
                }
            });

            // End attack
            this.endCharge(duration);
        }
    }
    ability1Offset() {
        this.setOffset(40, 120);
    }
    ability1DisplayHitArea() {
        var width = 80;
        var height = 530;
        var distanceFromCaster = 265;
        return this.displayHitAreaRectangle(width, height, distanceFromCaster);
    }
    ability1Type() {
        return 'toggle_and_aim';
    }
    endCharge(duration) {
        activeScene.time.delayedCall(duration, () => {
            this.isAttacking = false;
            this.lockMovement = false;
            this.charging = false;
            this.invincible = false;
            activeScene.physics.world.removeCollider(this.chargeCollision);
        }, null, activeScene);
    }
}