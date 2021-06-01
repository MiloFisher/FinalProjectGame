class Mage extends Player {
    constructor(x, y, texture, colliderRadius, health) {
        super(x, y, texture, colliderRadius, health);

    }

    classSpecial() {

    }

    castEffect(type) {
        var distanceFromCaster = 40;
        var distX = 0;
        var distY = 0;
        switch (this.direction) {
            case 0: distX = 0; distY = -distanceFromCaster; break;
            case 1: distX = Math.sqrt(2) / 2 * distanceFromCaster; distY = Math.sqrt(2) / 2 * -distanceFromCaster; break;
            case 2: distX = distanceFromCaster; distY = 0; break;
            case 3: distX = Math.sqrt(2) / 2 * distanceFromCaster; distY = Math.sqrt(2) / 2 * distanceFromCaster; break;
            case 4: distX = 0; distY = distanceFromCaster; break;
            case 5: distX = Math.sqrt(2) / 2 * -distanceFromCaster; distY = Math.sqrt(2) / 2 * distanceFromCaster; break;
            case 6: distX = -distanceFromCaster; distY = 0; break;
            case 7: distX = Math.sqrt(2) / 2 * -distanceFromCaster; distY = Math.sqrt(2) / 2 * -distanceFromCaster; break;
        }
        var x = this.x + distX;
        var y = this.y + distY;
        var effect = new Phaser.GameObjects.Sprite(activeScene, x, y, 'cast_' + type)
        effect.angle = this.direction * 45;
        activeScene.add.existing(effect);
        return effect;
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
            activeScene.staffHit.play();
            player.anims.play(playerClass + '_attack', false);

            // Create Attack object
            var attack = new Attack(activeScene, this, this.direction, 60, 60, 40, damage);
            playerAttacks.push(attack);

            // End attack
            this.endAttack(attack, duration)
        }
    }
    basicOffset() {
        this.setOffset(0, 40);
    }

    // FIREBALL - MAGE ABILITY 0
    ability0(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown0) {
            // Set attack variables
            var abilityId = 0;
            var duration = 500;
            var cooldown = 2000;
            var damage = 6; // Explosion effect deals 2x damage to target, and 1x damage to surrounding enemies

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.ability0Offset();
            this.setCooldown(cooldown, abilityId);

            // Play attack animation
            activeScene.fireball.play();
            player.anims.play(playerClass + '_attack', false);
            var sprite = this.castEffect('fireball');

            // Create Attack object
            var attack = new Projectile(activeScene, this, this.direction, 40, 80, 30, damage, 6, 'fireball', 'explosion',250);
            projectiles.push(attack);
            playerAttacks.push(attack);

            // End attack
            this.endAttack(null, duration, sprite);
        }
    }
    ability0Offset() {
        this.setOffset(0, 40);
    }
    ability0DisplayHitArea() {
        var width = 40;
        var height = 300;
        var distanceFromCaster = 170;
        return [this.displayHitAreaRectangle(width, height, distanceFromCaster, this.direction)];
    }
    ability0Type() {
        return 'toggle_and_aim';
    }

    // LIGHTNING - MAGE ABILITY 1
    ability1(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown1) {
            // Set attack variables
            var abilityId = 1;
            var duration = 500;
            var cooldown = 4000;
            var damage = 5;
            var range = 800;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.ability1Offset();
            this.setCooldown(cooldown, abilityId);

            // Play attack animation
            activeScene.lightning.play();
            player.anims.play(playerClass + '_attack', false);
            var sprite = this.castEffect('lightning');

            // Create Attack object
            var attack = new Attack(activeScene, this, this.direction, range, range, 0, damage, 'lightning', 250);
            playerAttacks.push(attack);

            // End attack
            this.endAttack(attack, duration, sprite);
        }
    }
    ability1Offset() {
        this.setOffset(0, 40);
    }
    ability1DisplayHitArea() {
        var radius = 400;
        return this.displayHitAreaEnemies(radius);
    }
    ability1Type() {
        return 'single_use';
    }

    // FREEZE - MAGE ABILITY 2
    ability2(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown2) {
            // Set attack variables
            var abilityId = 2;
            var duration = 500;
            var cooldown = 4000;
            var damage = 1;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.ability2Offset();
            this.setCooldown(cooldown, abilityId);

            // Play attack animation
            activeScene.freeze.play();
            player.anims.play(playerClass + '_attack', false);
            var sprite = this.castEffect('freeze');

            // Create Attack object
            var attack = new Attack(activeScene, this, this.direction, 300, 240, 160, damage, 'freeze', 3000);
            playerAttacks.push(attack);

            // End attack
            this.endAttack(attack, duration, sprite);
        }
    }
    ability2Offset() {
        this.setOffset(0, 40);
    }
    ability2DisplayHitArea() {
        var width = 300;
        var height = 240;
        var distanceFromCaster = 160;
        return [this.displayHitAreaRectangle(width,height,distanceFromCaster)];
    }
    ability2Type() {
        return 'toggle_and_aim';
    }

    // METEOR - MAGE ABILITY 3
    ability3(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown3) {
            // Set attack variables
            var abilityId = 3;
            var duration = 1500;
            var cooldown = 4000;
            var damage = 15;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.ability3Offset();
            this.setCooldown(cooldown, abilityId);

            // Play attack animation
            activeScene.meteor.play();
            player.anims.play(playerClass + '_attack', false);
            var sprite = this.castEffect('meteor');

            // Create Attack object
            this.summonMeteor(damage, duration);

            // End attack
            this.endAttack(null, duration, sprite);
        }
    }
    ability3Offset() {
        this.setOffset(0, 40);
    }
    ability3DisplayHitArea() {
        var radius = 100;
        var distanceFromCaster = 140;
        return [this.displayHitAreaCircle(radius, distanceFromCaster)];
    }
    ability3Type() {
        return 'toggle_and_aim';
    }
    summonMeteor(damage, duration) {
        var distanceFromCaster = 140;
        var distX = 0;
        var distY = 0;
        switch (this.direction) {
            case 0: distX = 0; distY = -distanceFromCaster; break;
            case 1: distX = Math.sqrt(2) / 2 * distanceFromCaster; distY = Math.sqrt(2) / 2 * -distanceFromCaster; break;
            case 2: distX = distanceFromCaster; distY = 0; break;
            case 3: distX = Math.sqrt(2) / 2 * distanceFromCaster; distY = Math.sqrt(2) / 2 * distanceFromCaster; break;
            case 4: distX = 0; distY = distanceFromCaster; break;
            case 5: distX = Math.sqrt(2) / 2 * -distanceFromCaster; distY = Math.sqrt(2) / 2 * distanceFromCaster; break;
            case 6: distX = -distanceFromCaster; distY = 0; break;
            case 7: distX = Math.sqrt(2) / 2 * -distanceFromCaster; distY = Math.sqrt(2) / 2 * -distanceFromCaster; break;
        }
        var x = this.x + distX;
        var y = this.y + distY - 40;

        var fallDistance = 600;
        var effect = new Phaser.GameObjects.Sprite(activeScene, x, y - fallDistance, 'meteor')
        activeScene.add.existing(effect);

        var attack;
        var sprite;
        activeScene.tweens.add({
            targets: effect,
            y: y,
            duration: duration * .75,
            delay: 0,
            onComplete: () => {
                attack = new Attack(activeScene, this, this.direction, 200, 200, distanceFromCaster, damage);
                playerAttacks.push(attack);
                effect.destroy();
                activeScene.cameras.main.shake(200, 0.04);

                sprite = new Phaser.GameObjects.Sprite(activeScene, x, y, 'meteor_explosion');
                activeScene.add.existing(sprite);

                activeScene.meteorExplosion.play();
            }
        });

        activeScene.time.delayedCall(duration, () => {
            for (var i = 0; i < playerAttacks.length; i++) {
                if (playerAttacks[i] == attack) {
                    playerAttacks.splice(i, 1);
                    attack.destroy();
                }
            }
            sprite.destroy();
        }, null, activeScene);
    }
}