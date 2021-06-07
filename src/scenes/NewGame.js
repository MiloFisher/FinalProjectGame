class NewGame extends Phaser.Scene {
    constructor() {
        super("newGameScene");
    }

    preload() {
        this.load.image('menu_warrior', 'assets/menu/warrior.png');
        this.load.image('menu_rogue', 'assets/menu/rogue.png');
        this.load.image('menu_mage', 'assets/menu/mage.png');
        this.load.image('menu_necromancer', 'assets/menu/necromancer.png');
        this.load.image('menu_selector', 'assets/temp_menu_selector.png');
    }

    create() {
        // Set active scene
        activeScene = this;
        activeSceneKey = "newGameScene";

        // Define Input
        keyA = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyD = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyLEFT = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyENTER = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        keyESCAPE = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Choose class options
        this.selected = 0;
        this.options = [];
        var centerX = game.config.width;
        var centerY = game.config.height / 2;
        var alignment = 4;
        if(secretUnlocked) {
            alignment = 5;
        }
        this.selector = this.add.sprite((centerX * 1) / alignment, centerY, 'menu_selector').setOrigin(0.5);
        this.options.push(this.add.sprite((centerX * 1) / alignment, centerY, 'menu_warrior').setOrigin(0.5).setInteractive());
        this.options[0].on('pointerdown', function (pointer) { 
            if(activeScene.selected == 0) {
                activeScene.select();
            } 
            activeScene.selected = 0;
        });
        this.options.push(this.add.sprite((centerX * 2) / alignment, centerY, 'menu_rogue').setOrigin(0.5).setInteractive());
        this.options[1].on('pointerdown', function (pointer) {
            if (activeScene.selected == 1) {
                activeScene.select();
            }
            activeScene.selected = 1;
         });
        this.options.push(this.add.sprite((centerX * 3) / alignment, centerY, 'menu_mage').setOrigin(0.5).setInteractive());
        this.options[2].on('pointerdown', function (pointer) {
            if (activeScene.selected == 2) {
                activeScene.select();
            }
            activeScene.selected = 2;
         });
        if(secretUnlocked) {
            this.options.push(this.add.sprite((centerX * 4) / alignment, centerY, 'menu_necromancer').setOrigin(0.5).setInteractive());
            this.options[3].on('pointerdown', function (pointer) {
                if (activeScene.selected == 3) {
                    activeScene.select();
                }
                activeScene.selected = 3;
            });
        }

        // Header Text
        this.header = this.add.text(centerX / 2, 120, 'Choose a Class:', { font: "50px Gothic", fill: "#ffffff" }).setOrigin(0.5);
    }

    update() {
        if (this.enter()) {
            this.select();
        }
        if(this.escape()) {
            this.back();
        }
        if(this.left()) {
            if(this.selected > 0) {
                this.selected--;
            }
        }
        if (this.right()) {
            if (this.selected < this.options.length - 1) {
                this.selected++;
            }
        }
        this.drawSelected();
    }

    drawSelected(){
        for (var i = 0; i < this.options.length; i++) {
            this.options[i].alpha = .25;
        }
        this.options[this.selected].alpha = 1;
        this.selector.setPosition(this.options[this.selected].x, this.options[this.selected].y);
        var displayNames = ['Warrior', 'Rogue', 'Mage', 'Necromancer'];
        this.header.text = 'Choose a Class: ' + displayNames[this.selected];
    }

    select() {
        var classes = ['warrior', 'rogue','mage','necromancer'];
        playerClass = classes[this.selected];
        watchedCutscene1 = false;
        newGame = true;
        this.scene.start('level01Scene');
    }

    back() {
        this.scene.start('menuScene');
    }

    left() {
        return Phaser.Input.Keyboard.JustDown(keyA) || Phaser.Input.Keyboard.JustDown(keyLEFT);
    }
    right() {
        return Phaser.Input.Keyboard.JustDown(keyD) || Phaser.Input.Keyboard.JustDown(keyRIGHT);
    }
    enter() {
        return Phaser.Input.Keyboard.JustDown(keyENTER);
    }
    escape() {
        return Phaser.Input.Keyboard.JustDown(keyESCAPE);
    }
}