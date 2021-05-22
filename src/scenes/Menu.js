class Menu extends Phaser.Scene {
    constructor() {
        activeSceneKey = "menuScene";
        super(activeSceneKey);
    }

    preload() {
       
    }

    create() {
        // Set active scene
        activeScene = this;

        // Define Input
        keyW = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyS = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyUP = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyENTER = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Menu Options
        this.selected = 0;
        this.options = [];
        var centerX = game.config.width/2;
        var centerY = game.config.height/2;
        var gap = 70;
        var offset = 0;
        if(fileExists()) {
            this.options.push(this.add.text(centerX, centerY + gap * this.options.length, 'Continue', { font: "50px Gothic", fill: "#ffffff" }).setOrigin(0.5).setInteractive());
            offset = 1;
            this.options[0].on('pointerdown', function (pointer) { 
                if(activeScene.selected == 0) { 
                    activeScene.select(); 
                }
                activeScene.selected = 0;
            });
        }
        this.options.push(this.add.text(centerX, centerY + gap * this.options.length, 'New Game', { font: "50px Gothic", fill: "#ffffff" }).setOrigin(0.5).setInteractive());
        this.options[0 + offset].on('pointerdown', function (pointer) { 
            if (activeScene.selected == 0 + offset) {
                activeScene.select();
            }
            activeScene.selected = 0 + offset;
        });
        this.options.push(this.add.text(centerX, centerY + gap * this.options.length, 'Settings', { font: "50px Gothic", fill: "#ffffff" }).setOrigin(0.5).setInteractive());
        this.options[1 + offset].on('pointerdown', function (pointer) { 
            if (activeScene.selected == 1 + offset) {
                activeScene.select();
            }
            activeScene.selected = 1 + offset;
        });
        this.options.push(this.add.text(centerX, centerY + gap * this.options.length, 'Credits', { font: "50px Gothic", fill: "#ffffff" }).setOrigin(0.5).setInteractive());
        this.options[2 + offset].on('pointerdown', function (pointer) {
            if (activeScene.selected == 2 + offset) {
                activeScene.select();
            }
            activeScene.selected = 2 + offset;
        });
    }

    update() {
        if(this.enter()) {
            this.select();
        }
        if(this.up()) {
            this.selected--;
            if(this.selected < 0) {
                this.selected = this.options.length - 1;
            }
        }
        if (this.down()) {
            this.selected++;
            if (this.selected >= this.options.length) {
                this.selected = 0;
            }
        }
        this.paintOptions();
    }

    select() {
        var active = this.selected;
        if (!fileExists()) { 
            active += 1;
        }
        switch (active) {
            case 0: // Continue Game
                loadGame();
                break;
            case 1: // New Game
                this.scene.start('newGameScene'); 
                break;
            case 2: // Settings
                this.scene.start('settingsScene'); 
                break;
            case 3: // Credits
                this.scene.start('creditsScene');
                break;
        }
    }

    up() {
        return Phaser.Input.Keyboard.JustDown(keyW) || Phaser.Input.Keyboard.JustDown(keyUP);
    }  
    down() {
        return Phaser.Input.Keyboard.JustDown(keyS) || Phaser.Input.Keyboard.JustDown(keyDOWN);
    }
    enter() {
        return Phaser.Input.Keyboard.JustDown(keyENTER);
    }

    paintOptions() {
        for(var i = 0; i < this.options.length; i++) {
            this.options[i].setColor('#ffffff');
        }
        this.options[this.selected].setColor('#ff0000');
    }
}