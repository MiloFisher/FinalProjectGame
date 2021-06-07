class Settings extends Phaser.Scene {
    constructor() {
        super("settingsScene");
    }

    preload() {
        this.load.image('tower', 'assets/tower.png');
        this.load.image('volume_tab', 'assets/VolumeTab.png');
    }

    create() {
        // Set active scene
        activeScene = this;
        activeSceneKey = "settingsScene";

        // Set title & background
        var tower = activeScene.add.sprite(600, 360, 'tower').setOrigin(0.5);
        tower.setScale(.67);
        this.add.text(600, 100, 'SETTINGS', { font: "50px Gothic", fill: "#808080", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);

        // Master Volume
        var masterHeight = 240;
        this.master0 =  activeScene.add.sprite(465 + 30 * 0, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 0, masterHeight, '0', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master0.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master0);
            masterVolume = 0 * .2;
            updateMasterVolume();
        });
        this.master1 = activeScene.add.sprite(465 + 30 * 1, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 1, masterHeight, '1', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master1.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master1);
            masterVolume = 1 * .2;
            updateMasterVolume();
        });
        this.master2 = activeScene.add.sprite(465 + 30 * 2, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 2, masterHeight, '2', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master2.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master2);
            masterVolume = 2 * .2;
            updateMasterVolume();
        });
        this.master3 = activeScene.add.sprite(465 + 30 * 3, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 3, masterHeight, '3', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master3.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master3);
            masterVolume = 3 * .2;
            updateMasterVolume();
        });
        this.master4 = activeScene.add.sprite(465 + 30 * 4, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 4, masterHeight, '4', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master4.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master4);
            masterVolume = 4 * .2;
            updateMasterVolume();
        });
        this.master5 = activeScene.add.sprite(465 + 30 * 5, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 5, masterHeight, '5', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master5.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master5);
            masterVolume = 5 * .2;
            updateMasterVolume();
        });
        this.master6 = activeScene.add.sprite(465 + 30 * 6, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 6, masterHeight, '6', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master6.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master6);
            masterVolume = 6 * .2;
            updateMasterVolume();
        });
        this.master7 = activeScene.add.sprite(465 + 30 * 7, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 7, masterHeight, '7', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master7.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master7);
            masterVolume = 7 * .2;
            updateMasterVolume();
        });
        this.master8 = activeScene.add.sprite(465 + 30 * 8, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 8, masterHeight, '8', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master8.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master8);
            masterVolume = 8 * .2;
            updateMasterVolume();
        });
        this.master9 = activeScene.add.sprite(465 + 30 * 9, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 9, masterHeight, '9', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.master9.on('pointerup', function (pointer) {
            activeScene.setMasterTint(activeScene.master9);
            masterVolume = 9 * .2;
            updateMasterVolume();
        });

        // Music Volume
        var musicHeight = 400;
        this.music0 = activeScene.add.sprite(465 + 30 * 0, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 0, musicHeight, '0', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music0.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music0);
            musicVolume = 0 * .2;
            updateMusicVolume();
        });
        this.music1 = activeScene.add.sprite(465 + 30 * 1, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 1, musicHeight, '1', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music1.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music1);
            musicVolume = 1 * .2;
            updateMusicVolume();
        });
        this.music2 = activeScene.add.sprite(465 + 30 * 2, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 2, musicHeight, '2', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music2.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music2);
            musicVolume = 2 * .2;
            updateMusicVolume();
        });
        this.music3 = activeScene.add.sprite(465 + 30 * 3, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 3, musicHeight, '3', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music3.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music3);
            musicVolume = 3 * .2;
            updateMusicVolume();
        });
        this.music4 = activeScene.add.sprite(465 + 30 * 4, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 4, musicHeight, '4', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music4.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music4);
            musicVolume = 4 * .2;
            updateMusicVolume();
        });
        this.music5 = activeScene.add.sprite(465 + 30 * 5, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 5, musicHeight, '5', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music5.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music5);
            musicVolume = 5 * .2;
            updateMusicVolume();
        });
        this.music6 = activeScene.add.sprite(465 + 30 * 6, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 6, musicHeight, '6', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music6.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music6);
            musicVolume = 6 * .2;
            updateMusicVolume();
        });
        this.music7 = activeScene.add.sprite(465 + 30 * 7, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 7, musicHeight, '7', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music7.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music7);
            musicVolume = 7 * .2;
            updateMusicVolume();
        });
        this.music8 = activeScene.add.sprite(465 + 30 * 8, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 8, musicHeight, '8', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music8.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music8);
            musicVolume = 8 * .2;
            updateMusicVolume();
        });
        this.music9 = activeScene.add.sprite(465 + 30 * 9, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0);
        activeScene.add.text(465 + 30 * 9, musicHeight, '9', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        this.music9.on('pointerup', function (pointer) {
            activeScene.setMusicTint(activeScene.music9);
            musicVolume = 9 * .2;
            updateMusicVolume();
        });

        activeScene.add.text(600, masterHeight - 50, 'Master Volume', { font: 40 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);
        activeScene.add.text(600, musicHeight - 50, 'Music Volume', { font: 40 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0);

        switch (Math.trunc(masterVolume / .2)) {
            case 0: this.setMasterTint(this.master0); break;
            case 1: this.setMasterTint(this.master1); break;
            case 2: this.setMasterTint(this.master2); break;
            case 3: this.setMasterTint(this.master3); break;
            case 4: this.setMasterTint(this.master4); break;
            case 5: this.setMasterTint(this.master5); break;
            case 6: this.setMasterTint(this.master6); break;
            case 7: this.setMasterTint(this.master7); break;
            case 8: this.setMasterTint(this.master8); break;
            case 9: this.setMasterTint(this.master9); break;
        }

        switch (Math.trunc(musicVolume / .2)) {
            case 0: this.setMusicTint(this.music0); break;
            case 1: this.setMusicTint(this.music1); break;
            case 2: this.setMusicTint(this.music2); break;
            case 3: this.setMusicTint(this.music3); break;
            case 4: this.setMusicTint(this.music4); break;
            case 5: this.setMusicTint(this.music5); break;
            case 6: this.setMusicTint(this.music6); break;
            case 7: this.setMusicTint(this.music7); break;
            case 8: this.setMusicTint(this.music8); break;
            case 9: this.setMusicTint(this.music9); break;
        }

        // Credits Options
        this.selected = 0;
        this.options = [];
        var centerX = game.config.width / 2;
        var centerY = game.config.height / 2;
        var gap = 70;
        var offset = 0;
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

    setMasterTint(value) {
        this.master0.clearTint();
        this.master1.clearTint();
        this.master2.clearTint();
        this.master3.clearTint();
        this.master4.clearTint();
        this.master5.clearTint();
        this.master6.clearTint();
        this.master7.clearTint();
        this.master8.clearTint();
        this.master9.clearTint();
        value.setTintFill(0xffff00);
    }

    setMusicTint(value) {
        this.music0.clearTint();
        this.music1.clearTint();
        this.music2.clearTint();
        this.music3.clearTint();
        this.music4.clearTint();
        this.music5.clearTint();
        this.music6.clearTint();
        this.music7.clearTint();
        this.music8.clearTint();
        this.music9.clearTint();
        value.setTintFill(0xffff00);
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