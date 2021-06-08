class Level03 extends Phaser.Scene {
    constructor() {
        super("level03Scene");
    }

    preload() {
        this.load.image('pathNode', 'assets/pathNode.png');
        this.load.image('tower', 'assets/tower.png');
        this.load.image('wispshot', 'assets/mobs1/projectile_wispshot.png');

        this.load.tilemapTiledJSON('map3', 'assets/levels/level03.json');
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
        activeSceneKey = "level03Scene";

        // Reset
        reset();

        // Create tile map
        map = this.make.tilemap({ key: 'map3' });
        map.setCollisionByProperty({ walkable: false });
        var tileset = map.addTilesetImage('stage_1_tileset', 'tiles');
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
        var posX = 64 * 80 + 40;
        var posY = 2 * 80 + 40;
        switch (playerClass) {
            case 'warrior': player = new Warrior(posX, posY, playerClass + '_idle', 40); break;
            case 'rogue': player = new Rogue(posX, posY, playerClass + '_idle', 40); break;
            case 'mage': player = new Mage(posX, posY, playerClass + '_idle', 40); break;
            case 'necromancer': player = new Necromancer(posX, posY, playerClass + '_idle', 40, 100); break;
        }
        player.angle = 180;
        this.cameras.main.setBounds(0, 0, map.width * 80, map.height * 80);
        this.cameras.main.startFollow(player);

        // Create Entites
        enemies = [];
        spawnSlime(86, 79, player);
        spawnSlime(90, 73, player);
        spawnSlime(96, 84, player);
        spawnSlime(83, 88, player);

        spawnBear(7, 11, player);
        spawnBear(21, 12, player);
        spawnBear(8, 21, player);
        spawnBear(21, 31, player);
        spawnBear(52, 30, player);
        spawnBear(71, 27, player);
        spawnBear(87, 23, player);
        spawnBear(87, 36, player);
        spawnBear(12, 54, player);
        spawnBear(31, 52, player);
        spawnBear(51, 48, player);
        spawnBear(69, 40, player);
        spawnBear(23, 65, player);
        spawnBear(44, 66, player);
        spawnBear(58, 62, player);
        spawnBear(56, 82, player);
        spawnBear(31, 92, player);

        spawnWisp(9, 21, player);
        spawnWisp(25, 14, player);
        spawnWisp(21, 34, player);
        spawnWisp(51, 38, player);
        spawnWisp(59, 40, player);
        spawnWisp(73, 31, player);
        spawnWisp(90, 14, player);
        spawnWisp(92, 18, player);
        spawnWisp(90, 31, player);
        spawnWisp(62, 49, player);
        spawnWisp(82, 48, player);
        spawnWisp(71, 66, player);
        spawnWisp(24, 49, player);
        spawnWisp(9, 70, player);
        spawnWisp(41, 67, player);
        spawnWisp(47, 86, player);
        spawnWisp(47, 52, player);

        spawnChest(96, 71);
        spawnChest(91, 15);
        spawnChest(7, 8);
        spawnChest(26, 49);
        spawnChest(68, 52);

        // HUD     
        createMenu();
        createSettings();
        createHUD();
        createInventory();
        loadInventory();

        // Collisions
        addTriangles();
        this.physics.add.collider(player, layer, () => { }); //, diagonalCollision (after {})
        this.physics.add.overlap(player, groundItems, (_player, _item) => {
            collectItem(_item);
        });

        this.started = true;

        // Cutscenes
        var wait = cutscene('start', 5000, 0, 'The path disappears into this forest... \nI have to find where it starts back up again. ', null, playerClass + '_talking');
        cutscene('end', 1000, wait, '');

        // Save game
        saveGame();
    }

    update() {
        if (this.started) {
            // Update Entities
            if (!inCutscene) {
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
                if (!this.backgroundMusic.isPlaying) {
                    this.backgroundMusic.play();
                }

                // Next level check
                if (player.x < 3 * 80 && player.y > 97 * 80) {
                    saveGame();
                    game.sound.stopAll();
                    this.scene.start('demoOverScene');
                }
            }
        }
    }
}