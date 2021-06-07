class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    preload() {
        this.load.image('tower', 'assets/tower.png');
    }

    create() {
        // Set active scene
        activeScene = this;
        activeSceneKey = "creditsScene";

        // Set title & background
        var tower = activeScene.add.sprite(600, 360, 'tower').setOrigin(0.5);
        tower.setScale(.67);
        this.add.text(600, 100, 'CREDITS', { font: "50px Gothic", fill: "#808080", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);

        // Credits Options
        this.selected = 0;
        this.options = [];
        var centerX = game.config.width / 2;
        var centerY = game.config.height / 2;
        var gap = 70;
        var offset = 0;

        // Our Credits
        this.add.text(centerX - 400, centerY + gap * -2, 'Bill Wong:                    Sound Engineer', { font: "50px Gothic", fill: "#c000ff", stroke: '#000000', strokeThickness: 5 });
        this.add.text(centerX - 400, centerY + gap * -1, 'Mark Wolverton:          Storyboard Writer', { font: "50px Gothic", fill: "#c10000", stroke: '#000000', strokeThickness: 5 });
        this.add.text(centerX - 400, centerY + gap * 0, 'Milo Fisher:                  Lead Programmer  ', { font: "50px Gothic", fill: "#00ffff", stroke: '#000000', strokeThickness: 5 });
        this.add.text(centerX - 400, centerY + gap * 1, 'Zirui Li:                        Lead Artist      ', { font: "50px Gothic", fill: "#00ff00", stroke: '#000000', strokeThickness: 5 });

        this.options.push(this.add.text(centerX, centerY + gap * 3, 'Back', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 5 }).setOrigin(0.5).setInteractive());
        this.options[0 + offset].on('pointerdown', function (pointer) {
            if (activeScene.selected == 0 + offset) {
                activeScene.back();
            }
            activeScene.selected = 0 + offset;
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