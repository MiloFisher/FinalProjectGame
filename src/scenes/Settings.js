class Settings extends Phaser.Scene {
    constructor() {
        activeSceneKey = "settingsScene";
        super(activeSceneKey);
    }

    preload() {

    }

    create() {
        // Set active scene
        activeScene = this;

        // Define Input
        keyESCAPE = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update() {
        if (this.escape()) {
            this.back();
        }
    }

    back() {
        this.scene.start('menuScene');
    }

    escape() {
        return Phaser.Input.Keyboard.JustDown(keyESCAPE);
    }
}