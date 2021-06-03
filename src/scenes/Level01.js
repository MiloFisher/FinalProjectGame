class Level01 extends Phaser.Scene {
    constructor() {
        activeSceneKey = "level01Scene";
        super(activeSceneKey);
    }

    preload() {
        //this.load.image('player', 'assets/temp_player.png');
        this.load.image('zombie', 'assets/temp_zombie.png');
        this.load.image('pathNode', 'assets/pathNode.png');

        this.load.tilemapTiledJSON('map', 'assets/tilemap.json');
        this.load.image('tiles', 'assets/tiles/stage_1_tileset.png');

        // sounds
        loadPlayerSounds(this);
        this.load.audio('slime_hurt', './assets/SlimeHurt.mp3');

        // sprite sheets
        loadPlayerSpritesheets(this);
        this.load.spritesheet('slime_walking', './assets/mobs1/slime_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
        this.load.spritesheet('slime_idle', './assets/mobs1/slime_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    }

    create() {
        // Set active scene
        activeScene = this;

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

        // Sound
        createPlayerSounds();
        this.slimeMoveSound = activeScene.sound.add('slime_hurt', {
            rate: 1,
            volume: .75,
            loop: false
        });
        this.slimeHurtSound = activeScene.sound.add('slime_hurt', {
            rate: .5,
            volume: 1.5,
            loop: false
        });
        this.slimeAttackSound = activeScene.sound.add('slime_hurt', {
            rate: 2,
            volume: 1.5,
            loop: false
        });

        // Create Player
        var posX = 2 * 80;
        var posY = 6 * 80;
        switch(playerClass) {
            case 'warrior': player = new Warrior(posX, posY, playerClass + '_idle', 40, 100); break;
            case 'rogue': player = new Rogue(posX, posY, playerClass + '_idle', 40, 100); break;
            case 'mage': player = new Mage(posX, posY, playerClass + '_idle', 40, 100); break;
            case 'necromancer': player = new Necromancer(posX, posY, playerClass + '_idle', 40, 100); break;
        }
        this.cameras.main.setBounds(0,0,map.width * 80,map.height * 80);
        this.cameras.main.startFollow(player);

        // Create Entites
        enemies = [];
        spawnSlime(16 * 80, 11 * 80, player);
        spawnSlime(17 * 80, 23 * 80, player);
        spawnSlime(6 * 80, 34 * 80, player);
        spawnSlime(29 * 80, 35 * 80, player);
        spawnSlime(38 * 80, 29 * 80, player);
        spawnSlime(50 * 80, 17 * 80, player);
        spawnSlime(54 * 80, 10 * 80, player);
        spawnSlime(57 * 80, 29 * 80, player);

        // Collisions
        addTriangles();
        this.physics.add.collider(player, layer, () => { }); //diagonalCollision

        // HUD
        createMenu();
        createHUD();
        createInventory();

        this.started = true;
    }

    update() {
        if(this.started) {
            // Update Entities
            player.update();
            enemies.forEach(e => {
                e.update();
            });
            projectiles.forEach(p => {
                p.update();
            });

            // Check Collisions
            for(var i = 0; i < playerAttacks.length; i++) {
                targetLoop:
                for (var j = 0; j < playerAttacks[i].targets.length; j++) {
                    if (playerAttacks[i].targets[j].body != undefined && circleToRotatedRectOverlap(playerAttacks[i].targets[j].x, playerAttacks[i].targets[j].y, playerAttacks[i].targets[j].body.radius, playerAttacks[i].width, playerAttacks[i].height, playerAttacks[i].x, playerAttacks[i].y, playerAttacks[i].angle)) {
                        if (playerAttacks[i].effect == 'lightning') {
                            if (findDistance(playerAttacks[i].x, playerAttacks[i].y, playerAttacks[i].targets[j].x, playerAttacks[i].targets[j].y) < playerAttacks[i].width) {
                                playerAttacks[i].targets[j].lightning(playerAttacks[i].duration);
                            } else {
                                playerAttacks[i].targets.splice(j, 1);
                                break;
                            }
                        }
                        playerAttacks[i].targets[j].takeDamage(playerAttacks[i].damage);
                        if (playerAttacks[i].effect == 'stun') {
                            playerAttacks[i].targets[j].stun(playerAttacks[i].duration);
                        }
                        if (playerAttacks[i].effect == 'freeze') {
                            playerAttacks[i].targets[j].freeze(playerAttacks[i].duration);
                        }
                        if (playerAttacks[i].effect == 'explosion') {
                            explosion(playerAttacks[i], playerAttacks, playerAttacks[i].duration);
                        }
                        playerAttacks[i].targets.splice(j,1);
                        for (var k = 0; k < projectiles.length; k++) {
                            var _projectile = projectiles[k];
                            if(playerAttacks[i] == _projectile) {
                                playerAttacks.splice(i, 1);
                                projectiles.splice(k, 1);
                                _projectile.sprite.destroy();
                                _projectile.destroy();
                                break targetLoop;
                            }
                        }
                    }
                }
            }
            for (var i = 0; i < enemyAttacks.length; i++) {
                targetLoop:
                for (var j = 0; j < enemyAttacks[i].targets.length; j++) {
                    if (enemyAttacks[i].targets[j].body != undefined && circleToRotatedRectOverlap(enemyAttacks[i].targets[j].x, enemyAttacks[i].targets[j].y, enemyAttacks[i].targets[j].body.radius, enemyAttacks[i].width, enemyAttacks[i].height, enemyAttacks[i].x, enemyAttacks[i].y, enemyAttacks[i].angle)) {
                        enemyAttacks[i].targets[j].takeDamage(enemyAttacks[i].damage);
                        if (enemyAttacks[i].effect == 'explosion') {
                            explosion(enemyAttacks[i], enemyAttacks, enemyAttacks[i].duration);
                        }
                        enemyAttacks[i].targets.splice(j, 1);
                        for (var k = 0; k < projectiles.length; k++) {
                            var _projectile = projectiles[k];
                            if (enemyAttacks[i] == _projectile) {
                                enemyAttacks.splice(i, 1);
                                projectiles.splice(k, 1);
                                _projectile.sprite.destroy();
                                _projectile.destroy();
                                break targetLoop;
                            }
                        }
                    }
                }
            }
            for(var i = 0; i < projectiles.length; i++) {
                if(projectileTerrainCollision(projectiles[i])) {
                    var _projectile = projectiles[i];
                    if (_projectile.effect == 'explosion') {
                        explosion(_projectile, playerAttacks, _projectile.duration);
                    }
                    projectiles.splice(i, 1);
                    for (var j = 0; j < playerAttacks.length; j++) {
                        if (playerAttacks[j] == _projectile) {
                            playerAttacks.splice(j, 1);
                            break;
                        }
                    }
                    _projectile.sprite.destroy();
                    _projectile.destroy();
                }
            }
            var circle = new Phaser.Geom.Circle(player.x, player.y, player.body.radius);
            var rect = new Phaser.Geom.Rectangle(hud.x + this.cameras.main.worldView.x - hud.width * hudScale / 2, hud.y + this.cameras.main.worldView.y - hud.height * hudScale / 2, hud.width * hudScale, hud.height * hudScale);
            if (Phaser.Geom.Intersects.CircleToRectangle(circle, rect)) {
                hudComponents.forEach(h => {
                    h.alpha = .25;
                });
            } else {
                hudComponents.forEach(h => {
                    h.alpha = 1;
                });
            }
        }
    }
}