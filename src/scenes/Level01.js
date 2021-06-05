class Level01 extends Phaser.Scene {
    constructor() {
        activeSceneKey = "level01Scene";
        super(activeSceneKey);
    }

    preload() {
        this.load.image('pathNode', 'assets/pathNode.png');
        this.load.image('tower', 'assets/tower.png');
        this.load.image('wispshot', 'assets/mobs1/projectile_wispshot.png');

        this.load.tilemapTiledJSON('map', 'assets/tilemap.json');
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

        // Reset
        reset();

        // Save game
        saveGame();

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
        musicEffects.push(activeScene.backgroundMusic);

        // Update Volumes
        createVolumes();
        updateMasterVolume();
        updateMusicVolume();

        // Create Player
        var posX = 2 * 80 + 40;
        var posY = 6 * 80 + 40;
        switch(playerClass) {
            case 'warrior': player = new Warrior(posX, posY, playerClass + '_idle', 40, 100); break;
            case 'rogue': player = new Rogue(posX, posY, playerClass + '_idle', 40, 100); break;
            case 'mage': player = new Mage(posX, posY, playerClass + '_idle', 40, 100); break;
            case 'necromancer': player = new Necromancer(posX, posY, playerClass + '_idle', 40, 100); break;
        }
        player.angle = 90;
        this.cameras.main.setBounds(0,0,map.width * 80,map.height * 80);
        this.cameras.main.startFollow(player);

        // Create Entites
        enemies = [];
        spawnSlime(16, 11, player);
        spawnSlime(17, 23, player);
        spawnSlime(6, 34, player);
        spawnSlime(29, 35, player);
        spawnSlime(38, 29, player);
        spawnSlime(50, 17, player);
        spawnSlime(54, 10, player);
        spawnSlime(57, 29, player);

        spawnBear(5, 24, player);

        spawnWisp(15, 20, player);

        spawnChest(4, 6);

        // HUD
        createMenu();
        createSettings();
        createHUD();
        createInventory();

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
            activeScene.time.delayedCall(1000, () => {
                activeScene.tweens.add({
                    targets: activeScene.tower,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    y: 500,
                    duration: 25000,
                    //ease: 'Power2',
                    onComplete: function () {
                        if (activeScene.tower != undefined) {
                            activeScene.tower.destroy();
                        }
                    }
                });
            }, null, activeScene);
            var wait = cutscene('start', 2000, 0, 'The Tower of Dawn…', this.cutsceneMusic);
            wait += cutscene('continue', 4000, wait, 'It has stood tall over these remote plains\nfor as long as history can recall.');
            wait += cutscene('continue', 2000, wait, 'Nobody knows who built it, or why...');
            wait += cutscene('continue', 4000, wait, 'And there are few who would risk facing the monsters\nthat roam its halls in order to find out.');
            wait += cutscene('continue', 4000, wait, 'Many stories and legends offer different\nexplanations for how the Tower came to be...');
            wait += cutscene('continue', 3000, wait, 'But there is one detail that almost\nall the stories can agree on:');
            wait += cutscene('continue', 2000, wait, 'Whoever manages to reach the tower\'s pinnacle...');
            cutscene('end', 4000, wait, 'Will be rewarded with the power to\nfulfill their wildest goals and ambitions.', this.cutsceneMusic);
            watchedCutscene1 = true;
        }
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
            } else if (Phaser.Input.Keyboard.JustDown(keySPACE)) {
                cutscene('end', 0, 0, '');
                if(this.tower != undefined) {
                    this.tower.destroy();
                }
            }
        }
    }
}