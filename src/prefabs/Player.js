class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, colliderRadius) {
        super(scene, x, y, texture);
        // Player Configuration
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCircle(colliderRadius);
        this.movementSpeed = playerSpeed;

        // Define Player Input
        keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    update() {
        this.movement();
        
    }

    movement() {
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
            this.setVelocity(this.movementSpeed * h * 0.6, this.movementSpeed * v * 0.6);
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