class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture, colliderRadius) {
        super(activeScene, x, y, texture);
        // Player Configuration
        activeScene.add.existing(this);
        activeScene.physics.add.existing(this);
        this.body.collideWorldBounds = true;
        this.setCircle(colliderRadius);
        this.movementSpeed = playerSpeed;
        this.isAttacking = false;
        this.direction = 0;
        this.lockMovement = false;

        // Player Input
        keyW = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        activeScene.input.on('pointerdown', function (pointer) {
            player.basicAttack(pointer);
        }, activeScene);
        activeScene.input.on('gameobjectdown', (pointer, gameObject, event) => {
            player.basicAttack(pointer, gameObject);
        });
    }

    update() {
        if(!this.lockMovement) {
            this.movement();
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
        if (keyW.isDown) {
            v += -1;
        }
        if (keyA.isDown) {
            h += -1;
        }
        if (keyS.isDown) {
            v += 1;
        }
        if (keyD.isDown) {
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

    basicAttack(pointer,gameObject) {
        if(!this.isAttacking) {
            // On Attack start
            if(gameObject == undefined) {
                this.lookAt(activeScene.cameras.main.worldView.x + pointer.x, activeScene.cameras.main.worldView.y + pointer.y);
            } else {
                this.lookAt(gameObject.x, gameObject.y);
            }
            this.isAttacking = true;
            player.anims.play(playerClass + '_basic', true);
            var duration;
            var attack;
            switch(playerClass) {
                case 'warrior': 
                    this.setVelocity(0, 0);
                    this.setOffset(0, 80);
                    this.lockMovement = true;
                    duration = 250;
                    attack = new Attack(activeScene, this, this.direction, 40, 80, 5);
                    break;
                case 'rogue':
                    this.setOffset(0, 40);
                    duration = 500;
                    attack = new Projectile(activeScene, this, this.direction, 20, 20, 5, 4); 
                    projectiles.push(attack);
                    break;
                case 'mage': 
                    this.setOffset(0, 40);
                    duration = 500;
                    attack = new Attack(activeScene, this, this.direction, 40, 80, 5);
                    break;
                case 'necromancer':
                    duration = 500;
                    attack = new Attack(activeScene, this, this.direction, 40, 80, 5);
                    break;
            }
            playerAttacks.push(attack);

            // On Attack stop
            activeScene.time.delayedCall(duration, () => {
                this.isAttacking = false;
                this.lockMovement = false;
                for(var i = 0; i < playerAttacks.length; i++) {
                    if(playerAttacks[i] == attack) {
                        playerAttacks.splice(i,1);
                        attack.destroy();
                    }
                }
            }, null, activeScene);
        }
    }
}