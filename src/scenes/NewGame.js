class NewGame extends Phaser.Scene {
    constructor() {
        activeSceneKey = "newGameScene";
        super(activeSceneKey);
    }

    preload() {
        this.load.image('menu_warrior', 'assets/temp_menu_warrior.png');
        this.load.image('menu_rogue', 'assets/temp_menu_rogue.png');
        this.load.image('menu_mage', 'assets/temp_menu_mage.png');
        this.load.image('menu_necromancer', 'assets/temp_menu_necromancer.png');
        this.load.image('menu_selector', 'assets/temp_menu_selector.png');
    }

    create() {
        // Set active scene
        activeScene = this;

        // Define Input
        keyA = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyD = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyLEFT = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyENTER = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
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
        this.options.push(this.add.sprite((centerX * 1) / alignment, centerY, 'menu_warrior').setOrigin(0.5));
        this.options.push(this.add.sprite((centerX * 2) / alignment, centerY, 'menu_rogue').setOrigin(0.5));
        this.options.push(this.add.sprite((centerX * 3) / alignment, centerY, 'menu_mage').setOrigin(0.5));
        if(secretUnlocked) {
            this.options.push(this.add.sprite((centerX * 4) / alignment, centerY, 'menu_necromancer').setOrigin(0.5));
        }

        // Header Text
        this.add.text(centerX / 2, 120, 'Choose a Class:', { font: "50px Gothic", fill: "#ffffff" }).setOrigin(0.5);

    }

    update() {
        if (this.enter()) {
            this.select();
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
    }

    select() {
        var classes = ['warrior', 'rogue', 'mage', 'necromancer']
        playerClass = classes[this.selected];
        this.scene.start('level01Scene');
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
}