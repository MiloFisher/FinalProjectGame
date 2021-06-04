class Rogue extends Player {
    constructor(x, y, texture, colliderRadius, health) {
        super(x, y, texture, colliderRadius, health);
        
    }

    classSpecial() {
        if (this.stealth) {
            var color = 0x3b3b3b;
            this.setTint(color, color, color, color);
            this.alpha = .5;
        }
    }

    basicAttack(pointer, gameObject) {      
        if (!this.isAttacking) {
            // Set attack variables
            var duration = 500;
            var damage = 3;

            // Call helper functions
            this.setupAttack(pointer, gameObject, false);
            this.basicOffset();

            // Play attack animation
            activeScene.arrowShot.play();
            player.anims.play(playerClass + '_basic', true);

            // Create Attack object
            var attack = new Projectile(activeScene, this, this.direction, 10, 20, 20, damage, 8, 'arrow');
            projectiles.push(attack);
            playerAttacks.push(attack);

            // Attacking breaks stealth
            this.stealth = false;
            this.clearTint();
            this.alpha = 1;

            // End attack
            this.endAttack(null, duration);
        }
    }
    basicOffset() {
        this.setOffset(0, 40);
    }

    // BACKSTAB - ROGUE ABILITY 0
    ability0(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown0) {
            // Set attack variables
            var abilityId = 0;
            var duration = 600;
            var cooldown = 4500;
            var damage = 12;
            var range = 600;

            // If gameObject is not specified, assign closest enemy to it 
            if (gameObject == undefined) {
                var closest = 0;
                for (var i = 1; i < enemies.length; i++) {
                    if (findDistance(enemies[i].x, enemies[i].y, this.x, this.y) < findDistance(enemies[closest].x, enemies[closest].y, this.x, this.y)) {
                        closest = i;
                    }
                }
                if (enemies.length > 0) {
                    gameObject = enemies[closest];
                } else {
                    return;
                }
            }

            // Check if in range
            if(findDistance(this.x,this.y,gameObject.x,gameObject.y) > range) {
                return;
            }

            // Call helper functions
            this.setupBackstab(gameObject);
            this.setCooldown(cooldown, abilityId);

            // Play attack animation
            activeScene.backstab.play();
            player.anims.play(playerClass + '_backstab', true);

            // Create Attack object
            var attack = new Attack(activeScene, this, this.direction, 20, 60, 60, damage, 'stun', 3000);
            playerAttacks.push(attack);
            var sprite = new Phaser.GameObjects.Sprite(activeScene, gameObject.x, gameObject.y, 'slash');
            sprite.angle = this.direction * 45;
            activeScene.add.existing(sprite);

            // Attacking breaks stealth
            this.stealth = false;
            this.clearTint();
            this.alpha = 1;

            // End attack
            this.endAttack(attack, duration, sprite);
        }
    }
    ability0Offset() {
        this.setOffset(0, 0);
    }
    ability0DisplayHitArea() {
        var radius = 600;
        return this.displayHitAreaEnemies(radius);
    }
    ability0Type() {
        return 'toggle_and_aim';
    }
    setupBackstab(gameObject) {
        this.isAttacking = true;
        this.teleporting = true;
        this.setOffset(80, 40);

        // Get tile behind target
        var gap = gameObject.body.radius + this.body.radius;
        switch (gameObject.direction) {
            case 0: this.x = gameObject.x; this.y = gameObject.y + gap; break;
            case 1: this.x = gameObject.x - gap; this.y = gameObject.y + gap; break;
            case 2: this.x = gameObject.x - gap; this.y =  gameObject.y; break;
            case 3: this.x = gameObject.x - gap; this.y =  gameObject.y - gap; break;
            case 4: this.x = gameObject.x; this.y =  gameObject.y - gap; break;
            case 5: this.x = gameObject.x + gap; this.y =  gameObject.y - gap; break;
            case 6: this.x = gameObject.x + gap; this.y =  gameObject.y; break;
            case 7: this.x = gameObject.x + gap; this.y =  gameObject.y + gap; break;
        }

        this.setVelocity(0, 0);
        this.lockMovement = true;

        this.lookAt(gameObject.x, gameObject.y);

        activeScene.time.delayedCall(300, () => {
            this.teleporting = false
        }, null, activeScene);
    }

    // LOCKPICK - ROGUE ABILITY 1
    ability1(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown1) {
            // Set attack variables
            var abilityId = 1;
            var duration = 500;
            var cooldown = 1000;
            var range = 80;

            // Call helper functions
            this.ability1Offset();
            this.setCooldown(cooldown, abilityId);

            // Effect
            activeScene.lockpick.play();
            for(var i = 0; i < chests.length; i++) {
                if (findDistance(this.x, this.y, chests[i].x, chests[i].y) <= range) {
                    chests[i].open();
                    break;
                }
            }

            // End attack
            this.endAttack(null, duration);
        }
    }
    ability1Offset() {
        this.setOffset(0, 0);
    }
    ability1DisplayHitArea() {
        var radius = 40;
        var distanceFromCaster = 0;
        return [this.displayHitAreaCircle(radius, distanceFromCaster)];
    }
    ability1Type() {
        return 'single_use';
    }

    // STEALTH - ROGUE ABILITY 2
    ability2(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown2) {
            // Set attack variables
            var abilityId = 2;
            var duration = 5000;
            var cooldown = 15000;

            // Call helper functions
            this.ability2Offset();
            this.setCooldown(cooldown, abilityId);

            // Effect
            activeScene.stealth.play();
            this.stealth = true;

            // End attack
            this.endStealth(duration);
        }
    }
    ability2Offset() {
        this.setOffset(0, 0);
    }
    ability2DisplayHitArea() {
        var radius = 40;
        var distanceFromCaster = 0;
        return [this.displayHitAreaCircle(radius, distanceFromCaster)];
    }
    ability2Type() {
        return 'single_use';
    }
    endStealth(duration) {
        activeScene.time.delayedCall(duration, () => {
            this.stealth = false;
            this.clearTint();
            this.alpha = 1;
        }, null, activeScene);
    }

    // FLURRY - ROGUE ABILITY 3
    ability3(pointer, gameObject) {
        if (!this.isAttacking && !this.cooldown3) {
            // Set attack variables
            var abilityId = 3;
            var duration = 500;
            var cooldown = 5000;
            var damage = 5;

            // Call helper functions
            this.setupAttack(pointer, gameObject, true);
            this.setCooldown(cooldown, abilityId);
            this.setOffset(40, 0);

            // Play attack animation
            activeScene.flurry.play();
            player.anims.play(playerClass + '_flurry', true);

            // Create Attack object
            this.flurryAttack(damage, duration);

            // Attacking breaks stealth
            this.stealth = false;
            this.clearTint();
            this.alpha = 1;

            // End attack
            this.endAttack(null, duration);
        }
    }
    ability3Offset() {
        this.setOffset(0, 0);
    }
    ability3DisplayHitArea() {
        var width = 20;
        var height = 200;
        var distanceFromCaster = 120;
        var direction0 = this.direction;
        var direction1 = (this.direction - 1) % 8;
        var direction2 = (this.direction + 1) % 8;
        if (direction1 < 0) {
            direction1 = 7;
        }
        return [this.displayHitAreaRectangle(width, height, distanceFromCaster, direction0), this.displayHitAreaRectangle(width, height, distanceFromCaster, direction1), this.displayHitAreaRectangle(width, height, distanceFromCaster, direction2) ];
    }
    ability3Type() {
        return 'toggle_and_aim';
    }
    flurryAttack(damage, duration) {
        var shurikenSize = 20;
        var direction0 = this.direction;
        var direction1 = (this.direction - 1) % 8;
        var direction2 = (this.direction + 1) % 8;
        if (direction1 < 0) {
            direction1 = 7;
        }

        var attack = new Projectile(activeScene, this, direction0, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
        projectiles.push(attack);
        playerAttacks.push(attack);
        var attack = new Projectile(activeScene, this, direction1, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
        projectiles.push(attack);
        playerAttacks.push(attack);
        var attack = new Projectile(activeScene, this, direction2, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
        projectiles.push(attack);
        playerAttacks.push(attack);

        activeScene.time.delayedCall(duration / 3, () => {
            var attack = new Projectile(activeScene, this, direction0, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
            projectiles.push(attack);
            playerAttacks.push(attack);
            var attack = new Projectile(activeScene, this, direction1, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
            projectiles.push(attack);
            playerAttacks.push(attack);
            var attack = new Projectile(activeScene, this, direction2, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
            projectiles.push(attack);
            playerAttacks.push(attack);
        }, null, activeScene);

        activeScene.time.delayedCall(duration * 2 / 3, () => {
            var attack = new Projectile(activeScene, this, direction0, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
            projectiles.push(attack);
            playerAttacks.push(attack);
            var attack = new Projectile(activeScene, this, direction1, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
            projectiles.push(attack);
            playerAttacks.push(attack);
            var attack = new Projectile(activeScene, this, direction2, shurikenSize, shurikenSize, 20, damage, 8, 'shuriken');
            projectiles.push(attack);
            playerAttacks.push(attack);
        }, null, activeScene);
    }
}