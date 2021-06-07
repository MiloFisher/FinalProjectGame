class DemoOver extends Phaser.Scene {
    constructor() {
        super("demoOverScene");
    }

    preload() {
        this.load.image('demoOver', 'assets/demoScreen.png');
    }

    create() {
        // Set active scene
        activeScene = this;
        activeSceneKey = "demoOverScene";

        // Set title & background
        this.add.sprite(600, 360, 'demoOver').setOrigin(0.5);
  
        // Demo Over Options
        this.selected = 0;
        this.options = [];
        var centerX = game.config.width / 2;
        var centerY = game.config.height / 2;
        var gap = 70;
        this.options.push(this.add.text(centerX, centerY + gap * 4, 'Return to menu', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 5 }).setOrigin(0.5).setInteractive());
        this.options[0].on('pointerdown', function (pointer) {
            if (activeScene.selected == 0) {
                activeScene.back();
            }
            activeScene.selected = 0;
        });

        // Define Input
        keyESCAPE = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        keyENTER = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (this.escape() || this.enter()) {
            this.back();
        }
        this.paintOptions();
    }

    back() {
        this.scene.start('menuScene');
    }

    escape() {
        return Phaser.Input.Keyboard.JustDown(keyESCAPE);
    }

    enter() {
        return Phaser.Input.Keyboard.JustDown(keyENTER);
    }

    paintOptions() {
        for (var i = 0; i < this.options.length; i++) {
            this.options[i].setColor('#ffffff');
        }
        this.options[this.selected].setColor('#ff0000');
    }
}