class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    preload() {
       
    }

    create() {
        // Set active scene
        activeScene = this;

        // Start Text
        this.text = this.add.text(500, 335, 'Press SPACE to start', { font: "50px Arial", fill: "#fff" });
        this.keySpace = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            this.scene.start('level01Scene');
        }
    }
}