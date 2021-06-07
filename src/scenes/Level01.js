class Level01 extends Phaser.Scene {
    constructor() {
        super("level01Scene");
    }

    preload() {
        this.load.image('pathNode', 'assets/pathNode.png');
        this.load.image('tower', 'assets/tower.png');
        this.load.image('wispshot', 'assets/mobs1/projectile_wispshot.png');

        this.load.tilemapTiledJSON('map', 'assets/levels/level01.json');
        this.load.image('tiles', 'assets/tiles/stage_1_tileset.png');

        // sounds
        loadPlayerSounds(this);
        this.load.audio('slime_hurt', './assets/SlimeHurt.mp3');
        this.load.audio('bear_hurt', './assets/BearHurt.mp3');
        this.load.audio('wisp_hurt', './assets/WispHurt.mp3');
        this.load.audio('background_music', './assets/BackgroundMusic1.wav');
        this.load.audio('cutscene_music', './assets/BossMusic.wav');

        // sprite sheets
        loadPlayerSpritesheets(this);
        this.load.spritesheet('slime_walking', './assets/mobs1/slime_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
        this.load.spritesheet('slime_idle', './assets/mobs1/slime_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
        this.load.spritesheet('bear_walking', './assets/mobs1/bear_walking.png', { frameWidth: 80, frameHeight: 211, startFrame: 0, endFrame: 1 });
        this.load.spritesheet('bear_idle', './assets/mobs1/bear_idle.png', { frameWidth: 80, frameHeight: 211, startFrame: 0, endFrame: 0 });
        this.load.spritesheet('bear_attacking', './assets/mobs1/bear_attack.png', { frameWidth: 80, frameHeight: 211, startFrame: 0, endFrame: 0 });
        this.load.spritesheet('wisp_walking', './assets/mobs1/wisp_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
        this.load.spritesheet('wisp_idle', './assets/mobs1/wisp_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    }

    create() {
        // Set active scene
        activeScene = this;
        activeSceneKey = "level01Scene";

        // Reset
        reset();

        // Create tile map
        map = this.make.tilemap({ key: 'map' });
        map.setCollisionByProperty({ walkable: false });
        var tileset = map.addTilesetImage('stage_1_tileset','tiles');
        var layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

        // Set up level bounds
        this.physics.world.setBounds(0, 0, map.width * 80, map.height * 80);

        // Generate Path
        generatePathNodes();

        // Animations
        createPlayerAnimations();
        this.anims.create({
            key: 'slime_walking',
            frames: this.anims.generateFrameNumbers('slime_walking', { start: 0, end: 1, first: 0 }),
            frameRate: 4,
        });
        this.anims.create({
            key: 'slime_idle',
            frames: this.anims.generateFrameNumbers('slime_idle', { start: 0, end: 0, first: 0 }),
            frameRate: 0,
        });
        this.anims.create({
            key: 'bear_walking',
            frames: this.anims.generateFrameNumbers('bear_walking', { start: 0, end: 1, first: 0 }),
            frameRate: 4,
        });
        this.anims.create({
            key: 'bear_idle',
            frames: this.anims.generateFrameNumbers('bear_idle', { start: 0, end: 0, first: 0 }),
            frameRate: 0,
        });
        this.anims.create({
            key: 'bear_attacking',
            frames: this.anims.generateFrameNumbers('bear_attacking', { start: 0, end: 0, first: 0 }),
            frameRate: 0,
        });
        this.anims.create({
            key: 'wisp_walking',
            frames: this.anims.generateFrameNumbers('wisp_walking', { start: 0, end: 1, first: 0 }),
            frameRate: 4,
        });
        this.anims.create({
            key: 'wisp_idle',
            frames: this.anims.generateFrameNumbers('wisp_idle', { start: 0, end: 0, first: 0 }),
            frameRate: 0,
        });

        // Sound
        createPlayerSounds();
        this.slimeMoveSound = activeScene.sound.add('slime_hurt', {
            rate: 1,
            volume: .75,
            loop: false
        });
        soundEffects.push(activeScene.slimeMoveSound);
        this.slimeHurtSound = activeScene.sound.add('slime_hurt', {
            rate: .5,
            volume: 1.5,
            loop: false
        });
        soundEffects.push(activeScene.slimeHurtSound);
        this.slimeAttackSound = activeScene.sound.add('slime_hurt', {
            rate: 2,
            volume: 1.5,
            loop: false
        });
        soundEffects.push(activeScene.slimeAttackSound);
        this.bearMoveSound = activeScene.sound.add('thud', {
            rate: 1.3,
            volume: .5,
            loop: false
        });
        soundEffects.push(activeScene.bearMoveSound);
        this.bearHurtSound = activeScene.sound.add('bear_hurt', {
            rate: .5,
            volume: 1.5,
            loop: false
        });
        soundEffects.push(activeScene.bearHurtSound);
        this.bearAttackSound = activeScene.sound.add('bear_hurt', {
            rate: 1,
            volume: 1.5,
            loop: false
        });
        soundEffects.push(activeScene.bearAttackSound);
        this.wispMoveSound = activeScene.sound.add('wisp_hurt', {
            rate: 1.25,
            volume: .75,
            loop: false
        });
        soundEffects.push(activeScene.wispMoveSound);
        this.wispHurtSound = activeScene.sound.add('wisp_hurt', {
            rate: .75,
            volume: 1.5,
            loop: false
        });
        soundEffects.push(activeScene.wispHurtSound);
        this.wispAttackSound = activeScene.sound.add('wisp_hurt', {
            rate: 2.5,
            volume: 1.5,
            loop: false
        });
        soundEffects.push(activeScene.wispAttackSound);
        this.backgroundMusic = activeScene.sound.add('background_music', {
            rate: 1,
            volume: .2,
            loop: true,
        });
        musicEffects.push(activeScene.backgroundMusic);
        this.cutsceneMusic = activeScene.sound.add('cutscene_music', {
            rate: .5,
            volume: .5,
            loop: true,
        });
        musicEffects.push(activeScene.cutsceneMusic);

        // Update Volumes
        createVolumes();
        loadVolumes();
        updateMasterVolume();
        updateMusicVolume();

        // Create Player
        var posX = 4 * 80 + 40;
        var posY = 15 * 80 + 40;
        switch(playerClass) {
            case 'warrior': player = new Warrior(posX, posY, playerClass + '_idle', 40); break;
            case 'rogue': player = new Rogue(posX, posY, playerClass + '_idle', 40); break;
            case 'mage': player = new Mage(posX, posY, playerClass + '_idle', 40); break;
            case 'necromancer': player = new Necromancer(posX, posY, playerClass + '_idle', 40, 100); break;
        }
        player.angle = 90;
        this.cameras.main.setBounds(0,0,map.width * 80,map.height * 80);
        this.cameras.main.startFollow(player);

        // Create Entites
        enemies = [];
        spawnSlime(17, 18, player, true);
        spawnSlime(11, 33, player, true);
        spawnSlime(16, 42, player, true);
        spawnSlime(23, 35, player, true);
        spawnSlime(28, 26, player, true);
        spawnSlime(31, 25, player, true);
        spawnSlime(31, 29, player, true);

        // HUD     
        createMenu();
        createSettings();
        createHUD();
        createInventory();

        if(newGame) {
            newGame = false;
            playerLevel = 1;
            playerXP = 0;
            updateXPBar();
            inventoryComponents[5].text = playerLevel;
            switch(playerClass){
                case 'warrior': 
                    createItem('warrior_weapon', 'weapon', 1, 5, 0, false, 0);
                    createItem('warrior_armor', 'armor', 1, 5, 1, false, 0);
                    createItem('health_potion', 'item', 1, 0, 0, false);
                    break;
                case 'rogue':
                    createItem('rogue_weapon', 'weapon', 1, 5, 0, false, 0);
                    createItem('rogue_armor', 'armor', 1, 5, 1, false, 0);
                    createItem('health_potion', 'item', 1, 0, 0, false);
                    break;
                case 'mage':
                    createItem('mage_weapon', 'weapon', 1, 5, 0, false, 0);
                    createItem('mage_armor', 'armor', 1, 5, 1, false, 0);
                    createItem('health_potion', 'item', 1, 0, 0, false);
                    break;
            }
        } else {
            loadInventory();
        }

        // Collisions
        addTriangles();
        this.physics.add.collider(player, layer, () => { }); //, diagonalCollision (after {})
        this.physics.add.overlap(player, groundItems, (_player, _item) => {
            collectItem(_item);
        });

        this.started = true;

        // Cutscenes
        keySPACE = activeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if(!watchedCutscene1) {
            this.tower = activeScene.add.sprite(600,360,'tower').setOrigin(0.5).setScrollFactor(0);
            this.tower.depth = 4;
            this.tower.setScale(.67);
            var wait = cutscene('start', 2000, 0, 'The Tower of Dawn...', this.cutsceneMusic);
            wait += cutscene('continue', 4000, wait, 'It has stood tall over these remote plains\nfor as long as history can recall.');
            wait += cutscene('continue', 2000, wait, 'Nobody knows who built it, or why...');
            wait += cutscene('continue', 4000, wait, 'And there are few who would risk facing the monsters\nthat roam its halls in order to find out.');
            wait += cutscene('continue', 4000, wait, 'Many stories and legends offer different\nexplanations for how the Tower came to be...');
            wait += cutscene('continue', 3000, wait, 'But there is one detail that almost\nall the stories can agree on:');
            wait += cutscene('continue', 2000, wait, 'Whoever manages to reach the tower\'s pinnacle...');
            wait += cutscene('continue', 4000, wait, 'Will be rewarded with the power to\nfulfill their wildest goals and ambitions.');
            var towerTime = wait;
            activeScene.time.delayedCall(1000, () => {
                activeScene.tweens.add({
                    targets: activeScene.tower,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    y: 500,
                    duration: towerTime - 1000,
                    onComplete: function () {
                        if (activeScene.tower != undefined) {
                            activeScene.tower.destroy();
                        }
                    }
                });
            }, null, activeScene);
            switch(playerClass) {
                case 'warrior': 
                    wait += cutscene('continue', 4000, wait, 'And that\'s why my adventures\nhave taken me here!', null, playerClass + '_talking');
                    wait += cutscene('continue', 3000, wait, 'My home village is in need of protection...', null, playerClass + '_talking');
                    wait += cutscene('continue', 5000, wait, 'Whether from bandits or the occasional monster,\nits people live in constant fear.', null, playerClass + '_talking');
                    wait += cutscene('continue', 6000, wait, 'I\'ve always strived to hone my skill with the blade,\nso that I can become the hero my people need...', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'But, no matter how hard I trained...\nIt never seemed to be enough.', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'I was never hailed as the kind of\nhero I wanted to become.', null, playerClass + '_talking');
                    wait += cutscene('continue', 3000, wait, 'But!\nIf the legends of the Tower are true...!', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'If I can reach the pinnacle and\nobtain the Tower\'s blessing...', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'Then no threat to my village would\npossibly stand against me!', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'So...  It\'s time to face down\nwhatever perils lie within!', null, playerClass + '_talking');
                    wait += cutscene('end', 3000, wait, 'My destiny as a hero awaits!', this.cutsceneMusic, playerClass + '_talking');
                    break;
                case 'rogue':
                    wait += cutscene('continue', 4000, wait, 'And so, my desperation has brought\nme here, to the Tower\'s base.', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'Years ago, a tyrant took the\nthrone of my home country...', null, playerClass + '_talking');
                    wait += cutscene('continue', 5000, wait, 'He forces my people to work themselves to death,\nand steals all the fruits of their labor for himself.', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'Many have tried to rise up in\nrebellion against him before...', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, '...My mother and father included.\nNeither of them survived.', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'I need to avenge them...\nTo finish what they started...', null, playerClass + '_talking');
                    wait += cutscene('continue', 3000, wait, 'But I know I\'m not strong enough.\nNot yet.', null, playerClass + '_talking');
                    wait += cutscene('continue', 3000, wait, 'That\'s why the Tower is my only hope.', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'If the legends are true, and if\nI can claim that promised power...', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'Then I can finally break that bastard\'s\niron grip over my home.', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'All right, then...\nNo matter what deadly trials await me inside...', null, playerClass + '_talking');
                    wait += cutscene('end', 3000, wait, 'I have no choice -\nThere\'s nowhere for me to go but up!', this.cutsceneMusic, playerClass + '_talking');
                    break;
                case 'mage':
                    wait += cutscene('continue', 3000, wait, 'Thus, my curiosity has drawn me here.', null, playerClass + '_talking');
                    wait += cutscene('continue', 2000, wait, 'I have one singular goal in life:', null, playerClass + '_talking');
                    wait += cutscene('continue', 5000, wait, 'To perfect my arcane talents, and unlock\nthe magical secrets of the universe.', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'Imagine what mankind might be\ncapable of with those secrets...', null, playerClass + '_talking');
                    wait += cutscene('continue', 7000, wait, 'With the power to reshape reality at our fingertips, we could\neliminate the need to struggle and fight over limited resources...', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'It might even be possible to achieve\nsuch things as eternal life.', null, playerClass + '_talking');
                    wait += cutscene('continue', 5000, wait, 'That is why ancient, mysterious sites such as\nthe Tower are of great interest to me.', null, playerClass + '_talking');
                    wait += cutscene('continue', 7000, wait, 'Even if the rumors of the power it grants are false,\nstudying such relics can only add to my knowledge of the arcane.', null, playerClass + '_talking');
                    wait += cutscene('continue', 3000, wait, 'And if the rumors are true?', null, playerClass + '_talking');
                    wait += cutscene('continue', 5000, wait, 'Well then...  I may just be able to fulfill\nmy life\'s goal in one fell swoop.', null, playerClass + '_talking');
                    wait += cutscene('continue', 4000, wait, 'All right.  It\'s time I begin my ascent.', null, playerClass + '_talking');
                    wait += cutscene('end', 4000, wait, 'Whatever monsters I may find within\nshall fall before my magic!', this.cutsceneMusic, playerClass + '_talking');
                    break;
            }
            watchedCutscene1 = true;
        }

        // Save game
        saveGame();

        this.tutorialPhase = 0;
        this.tutorialText = undefined;
    }

    update() {
        if(this.started) {
            // Update Entities
            if(!inCutscene) {
                player.update();
                enemies.forEach(e => {
                    e.update();
                });
                projectiles.forEach(p => {
                    p.update();
                });

                // Check Collisions
                checkCollisions();

                // Music
                if(!this.backgroundMusic.isPlaying) {
                    this.backgroundMusic.play();
                }

                // Tutorial Contols
                this.tutorial();
            } else if (Phaser.Input.Keyboard.JustDown(keySPACE)) {
                cutscene('end', 0, 0, '', this.cutsceneMusic);
                if(this.tower != undefined) {
                    this.tower.destroy();
                }
            }
        }
    }

    tutorial() {
        var height = 110;
        switch(this.tutorialPhase) {
            case 0:
                // Prompt 1
                this.tutorialText = this.add.text(600, height, 'Use WASD to move', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0);
                this.tutorialText.depth = 6;
                this.tutorialPhase = 1;
                break;
            case 1:
                // Wait for action 1
                if(player.x > 8 * 80) {
                    this.tutorialText.destroy();
                    this.tutorialPhase = 2;
                }
                break;
            case 2:
                // Prompt 2
                this.tutorialText = this.add.text(600, height, 'Use Left-Click to attack', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0);
                this.tutorialText.depth = 6;
                this.tutorialPhase = 3;
                break;
            case 3:
                // Wait for action 2
                if (player.y > 27 * 80) {
                    this.tutorialText.destroy();
                    this.tutorialPhase = 4;
                }
                break;
            case 4:
                // Prompt 3
                this.tutorialText = this.add.text(600, height, 'Use 1, 2, 3, 4 to activate your combat abilities\nand left-click to attack when aiming', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4, align: 'center' }).setOrigin(0.5).setScrollFactor(0);
                this.tutorialText.depth = 6;
                this.tutorialPhase = 5;
                break;
            case 5:
                // Wait for action 3
                if (player.x > 32 * 80) {
                    this.tutorialText.destroy();
                    this.tutorialPhase = 6;
                }
                break;
            case 6:
                // Prompt 4
                this.tutorialText = this.add.text(600, height, 'Use E to open your inventory', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0);
                this.tutorialText.depth = 6;
                this.tutorialPhase = 7;
                break;
            case 7:
                // Wait for action 4
                if (player.inventoryOpen) {
                    this.tutorialText.destroy();
                    this.tutorialPhase = 8;
                }
                break;
            case 8:
                // Prompt 5
                this.tutorialText = this.add.text(600, height, '<- Click & drag the potion to your Item slot', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0);
                this.tutorialText.depth = 6;
                this.tutorialPhase = 9;
                break;
            case 9:
                // Wait for action 5
                if (inventory[5][2] != undefined) {
                    this.tutorialText.destroy();
                    this.tutorialPhase = 10;
                }
                else {
                    var inventoryEmpty = true;
                    outer:
                    for(var r = 0; r < 5; r++) {
                        for(var c = 0; c < 11; c++) {
                            if(inventory[r][c] != undefined) {
                                inventoryEmpty = false;
                                break outer;
                            }
                        }
                    }
                    if(inventoryEmpty) {
                        createItem('health_potion', 'item', 1, 0, 0, true);
                    }
                }
                break;
            case 10:
                // Prompt 6
                this.tutorialText = this.add.text(600, height, 'Use E to close your inventory', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0);
                this.tutorialText.depth = 6;
                this.tutorialPhase = 11;
                break;
            case 11:
                // Wait for action 6
                if (!player.inventoryOpen) {
                    this.tutorialText.destroy();
                    this.tutorialPhase = 12;
                }
                break;
            case 12:
                // Prompt 7
                this.tutorialText = this.add.text(600, height, 'Use C to use your potion', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0);
                this.tutorialText.depth = 6;
                this.tutorialPhase = 13;
                break;
            case 13:
                // Wait for action 7
                if (inventory[5][2] == undefined) {
                    this.tutorialText.destroy();
                    this.tutorialPhase = 14;
                }
                break;
            case 14:
                // Prompt 8
                this.tutorialText = this.add.text(600, height, 'Leave the area', { font: "50px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0);
                this.tutorialText.depth = 6;
                this.tutorialPhase = 15;
                break;
            case 15:
                // Wait for action 8
                if (player.x > 48 * 80) {
                    saveGame();
                    game.sound.stopAll();
                    this.tutorialText.destroy();
                    this.scene.start('level02Scene');
                }
                break;
        }
    }
}