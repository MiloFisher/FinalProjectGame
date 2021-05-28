class Level01 extends Phaser.Scene {
    constructor() {
        activeSceneKey = "level01Scene";
        super(activeSceneKey);
    }

    preload() {
        //this.load.image('player', 'assets/temp_player.png');
        this.load.image('zombie', 'assets/temp_zombie.png');
        this.load.image('pathNode', 'assets/pathNode.png');

        this.load.tilemapTiledJSON('map', 'assets/temp_tilemap.json');
        this.load.image('tiles', 'assets/temp_tilegrid.png');

        // sounds
        loadSounds(this);

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

        // Set up level bounds
        this.physics.world.setBounds(0,0,2400,1440);

        // Create tile map
        map = this.make.tilemap({ key: 'map' });
        map.setCollisionByProperty({ walkable: false });
        var tileset = map.addTilesetImage('temp_tilegrid','tiles');
        var layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

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
        createSounds();

        // Create Player
        switch(playerClass) {
            case 'warrior': player = new Warrior(600, 380, playerClass + '_idle', 40, 100); break;
            case 'rogue': player = new Rogue(600, 380, playerClass + '_idle', 40, 100); break;
            case 'mage': player = new Mage(600, 380, playerClass + '_idle', 40, 100); break;
            case 'necromancer': player = new Necromancer(600, 380, playerClass + '_idle', 40, 100); break;
        }
        this.cameras.main.setBounds(0,0,2400,1440);
        this.cameras.main.startFollow(player);

        // Create Entites
        enemies = [];
        spawnSlime(100,100, player);
        spawnSlime(100,500, player);

        // Collisions
        addTriangles();
        this.physics.add.collider(player, layer, () => {}, diagonalCollision);

        // HUD
        createHUD();

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
                        playerAttacks[i].targets[j].takeDamage(playerAttacks[i].damage);
                        if(playerAttacks[i].effect == 'stun') {
                            playerAttacks[i].targets[j].stun(playerAttacks[i].duration);
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