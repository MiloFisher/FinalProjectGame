class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture, colliderRadius, health) {
        super(activeScene, x, y, texture);
        // Player Configuration
        activeScene.add.existing(this);
        activeScene.physics.add.existing(this);
        this.body.collideWorldBounds = true;
        this.setCircle(colliderRadius);
        this.depth = 2;
        this.movementSpeed = playerSpeed;
        this.isAttacking = false;
        this.invincible = false;
        this.direction = 0;
        this.lockMovement = false;
        this.hitColor = 0xff0000;
        this.health = health;
        this.maxHealth = health;
        this.selectedAbility = -1;
        this.displayHitArea;
        this.cooldown0 = false;
        this.cooldown1 = false;
        this.cooldown2 = false;
        this.cooldown3 = false;
        this.stealth = false;
        this.teleporting = false;
        this.blockInput = false;

        // Player Input
        keyW = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyE = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        keyC = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        key1 = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        key2 = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        key3 = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        key4 = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
        activeScene.input.on('pointerdown', function (pointer) {
            if (!player.blockInput) {
                switch(player.selectedAbility) {
                    case -1: player.basicAttack(pointer); break;
                    case 0: player.ability0(pointer); break;
                    case 1: player.ability1(pointer); break;
                    case 2: player.ability2(pointer); break;
                    case 3: player.ability3(pointer); break;
                }
                player.selectedAbility = -1;
                if (player.displayHitArea != undefined) {
                    player.destroyHitArea();
                }
            }
        }, activeScene);
        activeScene.input.on('gameobjectdown', (pointer, gameObject, event) => {
            if (!player.blockInput) {
                switch (player.selectedAbility) {
                    case -1: player.basicAttack(pointer, gameObject); break;
                    case 0: player.ability0(pointer, gameObject); break;
                    case 1: player.ability1(pointer, gameObject); break;
                    case 2: player.ability2(pointer, gameObject); break;
                    case 3: player.ability3(pointer, gameObject); break;
                }
                player.selectedAbility = -1;
                if (player.displayHitArea != undefined) {
                    player.destroyHitArea();
                }
            }
        });
    }

    update() {
        if(!this.lockMovement && this.displayHitArea == undefined) {
            this.movement();
        }else if(this.displayHitArea != undefined) {
            this.lookAt(activeScene.cameras.main.worldView.x + game.input.mousePointer.x, activeScene.cameras.main.worldView.y + game.input.mousePointer.y);
        }
        this.classSpecial();
        this.abilities();
        this.displayHitAreas();
        this.inventory();
    }

    inventory() {
        if (Phaser.Input.Keyboard.JustDown(keyE)) {
            setInventoryActive(!this.blockInput);
        }
    }

    destroyHitArea() {
        for(var i = 0; i < this.displayHitArea.length; i++) {
            this.displayHitArea[i].destroy();
        }
        this.displayHitArea = undefined;
    }

    abilities() {
        if(this.blockInput) {
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(key1) && !this.isAttacking) {
            var type = this.ability0Type();
            if (type == 'single_use') {
                this.ability0();
                this.selectedAbility = -1;
            } else if (type == 'toggle_and_aim' && !this.cooldown0) {
                if (this.selectedAbility == 0) {
                    this.selectedAbility = -1;
                } else {
                    this.selectedAbility = 0;
                    this.anims.play(playerClass + '_ability_0', false);
                    this.ability0Offset();
                    this.setVelocity(0);
                    activeScene.walkSound.stop();
                }
            }
        }
        if (Phaser.Input.Keyboard.JustDown(key2) && !this.isAttacking) {
            var type = this.ability1Type();
            if (type == 'single_use') {
                this.ability1();
                this.selectedAbility = -1;
            } else if (type == 'toggle_and_aim' && !this.cooldown1) {
                if (this.selectedAbility == 1) {
                    this.selectedAbility = -1;
                } else {
                    this.selectedAbility = 1;
                    this.anims.play(playerClass + '_ability_1', false);
                    this.ability1Offset();
                    this.setVelocity(0);
                    activeScene.walkSound.stop();
                }
            }
        }
        if (Phaser.Input.Keyboard.JustDown(key3) && !this.isAttacking) {
            var type = this.ability2Type();
            if (type == 'single_use') {
                this.ability2();
                this.selectedAbility = -1;
            } else if (type == 'toggle_and_aim' && !this.cooldown2) {
                if (this.selectedAbility == 2) {
                    this.selectedAbility = -1;
                } else {
                    this.selectedAbility = 2;
                    this.anims.play(playerClass + '_ability_2', false);
                    this.ability2Offset();
                    this.setVelocity(0);
                    activeScene.walkSound.stop();
                }
            }
        }
        if (Phaser.Input.Keyboard.JustDown(key4) && !this.isAttacking) {
            var type = this.ability3Type();
            if (type == 'single_use') {
                this.ability3();
                this.selectedAbility = -1;
            } else if (type == 'toggle_and_aim' && !this.cooldown3) {
                if (this.selectedAbility == 3) {
                    this.selectedAbility = -1;
                } else {
                    this.selectedAbility = 3;
                    this.anims.play(playerClass + '_ability_3', false);
                    this.ability3Offset();
                    this.setVelocity(0);
                    activeScene.walkSound.stop();
                }
            }
        }
    }

    displayHitAreas() {
        switch (this.selectedAbility) {
            case -1:
                if (this.displayHitArea != undefined) {
                    this.destroyHitArea();
                }
                break;
            case 0:
                if (this.displayHitArea != undefined) {
                    this.destroyHitArea();
                }
                this.displayHitArea = this.ability0DisplayHitArea();
                break;
            case 1:
                if (this.displayHitArea != undefined) {
                    this.destroyHitArea();
                }
                this.displayHitArea = this.ability1DisplayHitArea();
                break;
            case 2:
                if (this.displayHitArea != undefined) {
                    this.destroyHitArea();
                }
                this.displayHitArea = this.ability2DisplayHitArea();
                break;
            case 3:
                if (this.displayHitArea != undefined) {
                    this.destroyHitArea();
                }
                this.displayHitArea = this.ability3DisplayHitArea();
                break;
        }
    }

    movement() {
        if (!this.isAttacking) {
            this.setOffset(0, 0);
        }
        lastPlayerX = this.x;
        lastPlayerY = this.y;
        let h = 0;
        let v = 0;
        // Direction horizontal (h) & vertical (v) are set by combination of held keys
        if (keyW.isDown && !this.blockInput) {
            v += -1;
        }
        if (keyA.isDown && !this.blockInput) {
            h += -1;
        }
        if (keyS.isDown && !this.blockInput) {
            v += 1;
        }
        if (keyD.isDown && !this.blockInput) {
            h += 1;
        }
        this.lookDirection(h, v);
        // If not moving or moving purely UP, DOWN, LEFT, or RIGHT
        if(v == 0 || h == 0) {
            this.setVelocity(this.movementSpeed * h, this.movementSpeed  * v);
        } // If moving diagonally, reduce velocity to 60% of speed
        else {
            this.setVelocity(this.movementSpeed * h * diagonalSpeed, this.movementSpeed * v * diagonalSpeed);
        }
        // Set move animation
        if(this.body.velocity.x != 0 || this.body.velocity.y != 0) {
            if(this.isAttacking) {
                player.anims.play(playerClass + '_basic', true);
            } else {
                player.anims.play(playerClass + '_walking', true);
            }
            if (!activeScene.walkSound.isPlaying) {
                activeScene.walkSound.play();
            }
        } else {
            if (this.isAttacking) {
                player.anims.play(playerClass + '_basic', false);
            } else {
                player.anims.play(playerClass + '_idle', true);
            }
            activeScene.walkSound.stop();
        }
    }

    lookDirection(h,v) {
        if(h == 0 && v == 0) { // Not Moving
            return;
        } else if (h == 0 && v == -1) { // Moving Up
            this.angle = 0;
            this.direction = 0;
        } else if (h == 1 && v == -1) { // Moving Up, Right
            this.angle = 45;
            this.direction = 1;
        } else if (h == 1 && v == 0) { // Moving Right
            this.angle = 90;
            this.direction = 2;
        } else if (h == 1 && v == 1) { // Moving Right, Down
            this.angle = 135;
            this.direction = 3;
        } else if (h == 0 && v == 1) { // Moving Down
            this.angle = 180;
            this.direction = 4;
        } else if (h == -1 && v == 1) { // Moving Down, Left
            this.angle = 225;
            this.direction = 5;
        } else if (h == -1 && v == 0) { // Moving Left
            this.angle = 270;
            this.direction = 6;
        } else if (h == -1 && v == -1) { // Moving Left, Up
            this.angle = 315;
            this.direction = 7;
        }
    }

    lookAt(x,y) {
        var rad = Phaser.Math.Angle.Between(this.x,this.y,x,y);
        var deg = Phaser.Math.RadToDeg(rad);
        var gap = 45/2;
        if (deg >= -90 - gap && deg <= -90 + gap) {
            this.angle = 0; // look up
            this.direction = 0;
        } else if (deg >= 90 - gap && deg <= 90 + gap) {
            this.angle = 180; // look down
            this.direction = 4;
        } else if (deg >= 0 - gap && deg <= 0 + gap) {
            this.angle = 90; // look right
            this.direction = 2;
        } else if (deg >= 180 - gap || deg <= -180 + gap) {
            this.angle = 270; // look left
            this.direction = 6;
        } else if (deg >= -45 - gap && deg <= -45 + gap) {
            this.angle = 45; // look up, right
            this.direction = 1;
        } else if (deg >= 45 - gap && deg <= 45 + gap) {
            this.angle = 135; // look down, right
            this.direction = 3;
        } else if (deg >= 135 - gap && deg <= 135 + gap) {
            this.angle = 225; // look down, left
            this.direction = 5;
        } else if (deg >= -135 - gap && deg <= -135 + gap) {
            this.angle = 315; // look up, left
            this.direction = 7;
        } else {
            console.log('not caught');
        }
    }

    takeDamage(damage) {
        if (!this.invincible) {
            this.takingDamage = true;
            if(!this.isAttacking) {
                this.setTint(this.hitColor, this.hitColor, this.hitColor, this.hitColor);
            } else {
                this.clearTint();
            }
            this.health -= damage;
            updateHealthBar();
            if (this.health <= 0) {
                this.die();
            }
            activeScene.time.delayedCall(250, () => {
                if (this) {
                    this.clearTint();
                    this.takingDamage = false;
                }
            }, null, activeScene);
        }
    }

    die() {
        console.log("game over");
    }

    displayHitAreaCircle(radius, distanceFromCaster) {
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
        return activeScene.add.circle(x, y, radius, 0xff0000, .5);
    }

    displayHitAreaRectangle(width, height, distanceFromCaster, direction) {
        var distX = 0;
        var distY = 0;
        if(direction == undefined) {
            direction = this.direction;
        }
        switch (direction) {
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
        var rect = activeScene.add.rectangle(x, y, width, height, 0xff0000, .5);
        rect.angle = direction * 45;
        return rect;
    }

    displayHitAreaEnemies(radius) {
        var targets = [];
        if (enemies.length > 0) {
            for (var i = 0; i < enemies.length; i++) {
                if (findDistance(enemies[i].x, enemies[i].y, this.x, this.y) < radius) {
                    targets.push(activeScene.add.circle(enemies[i].x, enemies[i].y, enemies[i].body.radius, 0xff0000, .5));
                }
            }
            if(targets.length == 0) {
                this.selectedAbility = -1;
                return undefined;
            }
            return targets;
        } else {
            this.selectedAbility = -1;
            return undefined;
        }
    }

    setupAttack(pointer, gameObject, freezePlayer) {
        if (pointer != undefined && this.body.velocity.x == 0 && this.body.velocity.y == 0) {
            if (gameObject == undefined) {
                this.lookAt(activeScene.cameras.main.worldView.x + pointer.x, activeScene.cameras.main.worldView.y + pointer.y);
            } else {
                this.lookAt(gameObject.x, gameObject.y);
            }
        }
        this.isAttacking = true;
        if (freezePlayer) {
            this.setVelocity(0, 0);
            this.lockMovement = true;
        }
    }

    endAttack(attack, duration, sprite) {
        activeScene.time.delayedCall(duration, () => {
            this.isAttacking = false;
            this.lockMovement = false;
            if (attack != null) {
                for (var i = 0; i < playerAttacks.length; i++) {
                    if (playerAttacks[i] == attack) {
                        playerAttacks.splice(i, 1);
                        attack.destroy();
                    }
                }
            }
            if(sprite != undefined) {
                sprite.destroy();
            }
        }, null, activeScene);
    }

    setCooldown(cooldown, abilityId) {
        switch (abilityId) {
            case 0: this.cooldown0 = true; break;
            case 1: this.cooldown1 = true; break;
            case 2: this.cooldown2 = true; break;
            case 3: this.cooldown3 = true; break;
        }

        var cooldownSquare = activeScene.add.rectangle(hudIcons[abilityId + 2].x, hudIcons[abilityId + 2].y, hudIcons[abilityId + 2].width * hudScale, hudIcons[abilityId + 2].height * hudScale, 0xffffff, .5).setScrollFactor(0);
        cooldownSquare.depth = 1;
        activeScene.tweens.add({
            targets: cooldownSquare,
            y: hudIcons[abilityId + 2].y + hudIcons[abilityId + 2].height * hudScale / 2,
            scaleY: 0,
            duration: cooldown,
            delay: 0
        });

        // On Cooldown over
        activeScene.time.delayedCall(cooldown, () => {
            switch (abilityId) {
                case 0: this.cooldown0 = false; break;
                case 1: this.cooldown1 = false; break;
                case 2: this.cooldown2 = false; break;
                case 3: this.cooldown3 = false; break;
            }
            cooldownSquare.destroy();
        }, null, activeScene);
    }
}