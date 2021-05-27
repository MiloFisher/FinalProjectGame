class Warrior extends Player {
    constructor(x, y, texture, colliderRadius, health) {
        super(x, y, texture, colliderRadius, health);
        this.charging = false;
        this.chargeCollision;
        this.chargeTargets;
        this.whirlwind = false;
        this.attackBuff = 1;
        this.battlecry = false;
    }

    classSpecial() {
        if(this.charging) {
            this.anims.play(playerClass + '_charge', true);
            if (!activeScene.charge.isPlaying) {
                activeScene.charge.play();
            }
        }
        if(this.whirlwind) {
            this.angle += 25;
        }
        if(this.battlecry) {
            var color = 0x770000;
            this.setTint(color, color, color, color);
        }
    }

    basicAttack(pointer, gameObject) {
        if (!this.isAttacking) {
            // Set attack variables
            var duration = 250;
            var damage = 3;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.basicOffset();

            // Play attack animation
            player.anims.play(playerClass + '_basic', true);
            activeScene.swordSwing.play();

            // Create Attack object
            var attack = new Attack(activeScene, this, this.direction, 25, 80, 80, damage * this.attackBuff);
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
            var abilityId = 0;
            var duration = 600;
            var cooldown = 4500;
            var damage = 12;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.ability0Offset();
            this.setCooldown(cooldown, abilityId);

            // Play attack animation
            player.anims.play(playerClass + '_ground_slam', true);
            activeScene.groundSlam.play();

            // Create Attack object
            var attack = new Attack(activeScene, this, this.direction, 130, 130, 20, damage * this.attackBuff);
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
            var abilityId = 1;
            var duration = 750;
            var cooldown = 3000;
            var damage = 8;
            var chargeSpeed = 700;

            // Call helper functions
            this.setupAttack(pointer,gameObject,true);
            this.ability1Offset();
            this.setCooldown(cooldown, abilityId);

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
                _enemy.takeDamage(damage * this.attackBuff);
                activeScene.thud.play();
                activeScene.whirlwind.play();
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
            activeScene.charge.stop();
            if(!this.battlecry) {
                this.invincible = false;
            }
            activeScene.physics.world.removeCollider(this.chargeCollision);
        }, null, activeScene);
    }

    // WHIRLWIND - WARRIOR ABILITY 2
    ability2(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown2) {
            // Set attack variables
            var abilityId = 2;
            var duration = 1000;
            var cooldown = 6000;
            var damage = 3;
            var attacks = 5;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.ability2Offset();
            this.setCooldown(cooldown, abilityId);

            // Play attack animation
            player.anims.play(playerClass + '_whirlwind', true);

            // Create Attack object
            var startAngle = this.angle;
            this.whirlwind = true;
            this.whirlwindHits(0, attacks, duration, damage * this.attackBuff, startAngle);
        }
    }
    whirlwindHits(current, attacks, duration, damage, startAngle) {
        if(current == attacks) {
            this.isAttacking = false;
            this.lockMovement = false;
            this.whirlwind = false;
            this.angle = startAngle;
            return;
        }
        activeScene.whirlwind.play();
        var attack = new Attack(activeScene, this, (this.direction + current) % 8, 270 * diagonalSpeed, 270 * diagonalSpeed, 0, damage);
        playerAttacks.push(attack);
        activeScene.time.delayedCall(duration/attacks, () => {
            for (var i = 0; i < playerAttacks.length; i++) {
                if (playerAttacks[i] == attack) {
                    playerAttacks.splice(i, 1);
                    attack.destroy();
                }
            }
            this.whirlwindHits(current + 1, attacks, duration, damage, startAngle);
        }, null, activeScene);
    }
    ability2Offset() {
        this.setOffset(0, 120);
    }
    ability2DisplayHitArea() {
        var radius = 135;
        var distanceFromCaster = 0;
        return this.displayHitAreaCircle(radius, distanceFromCaster);
    }
    ability2Type() {
        return 'single_use';
    }

    // BATTLECRY - WARRIOR ABILITY 3
    ability3(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown3) {
            // Set attack variables
            var abilityId = 3;
            var duration = 5000;
            var cooldown = 15000;
            var damageMultiplier = 2;

            // Call helper functions
            this.ability3Offset();
            this.setCooldown(cooldown, abilityId);

            // Effect
            activeScene.battlecry.play();
            this.battlecry = true;
            this.attackBuff = damageMultiplier;
            this.invincible = true;

            // End attack
            this.endBattlecry(duration);
        }
    }
    ability3Offset() {
        this.setOffset(0, 0);
    }
    ability3DisplayHitArea() {
        var radius = 40;
        var distanceFromCaster = 0;
        return this.displayHitAreaCircle(radius, distanceFromCaster);
    }
    ability3Type() {
        return 'single_use';
    }
    endBattlecry(duration) {
        activeScene.time.delayedCall(duration, () => {
            this.battlecry = false;
            this.attackBuff = 1;
            this.clearTint();
            if(!this.charging) {
                this.invincible = false;
            }
        }, null, activeScene);
    }
}