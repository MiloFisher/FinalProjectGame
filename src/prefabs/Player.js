class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture, colliderRadius) {
        super(activeScene, x, y, texture);
        // Player Configuration
        activeScene.add.existing(this);
        activeScene.physics.add.existing(this);
        this.body.collideWorldBounds = true;
        this.setCircle(colliderRadius);
        this.movementSpeed = playerSpeed;
        this.separatedThisFrame = false;

        // Player Input
        keyW = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    update() {
        this.movement();
    
    }

    movement() {
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
    }

    lookDirection(h,v) {
        if(h == 0 && v == 0) { // Not Moving
            return;
        } else if (h == 0 && v == 1) { // Moving Up
            this.angle = 180;
        } else if (h == 1 && v == 1) { // Moving Up, Right
            this.angle = 135;
        } else if (h == 1 && v == 0) { // Moving Right
            this.angle = 90;
        } else if (h == 1 && v == -1) { // Moving Right, Down
            this.angle = 45;
        } else if (h == 0 && v == -1) { // Moving Down
            this.angle = 0;
        } else if (h == -1 && v == -1) { // Moving Down, Left
            this.angle = 315;
        } else if (h == -1 && v == 0) { // Moving Left
            this.angle = 270;
        } else if (h == -1 && v == 1) { // Moving Left, Up
            this.angle = 225;
        }
    }
}