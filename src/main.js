let config = {
    type: Phaser.WEBGL,
    width: 1200,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [Menu, NewGame, Settings, Credits, DemoOver, Level01, Level02 ]
}
let game = new Phaser.Game(config);

// global variables
let playerSpeed = 300;              // how fast the player will move
let playerAttack = 1;               // how much base attack the player has
let playerHealth = 30;              // how much base health the player has
let diagonalSpeed = .71;            // multiplier for how fast entities move diagonally
let cutsceneBars = [];              // holds black cutscene bars
let displayTexts = [];              // holds display texts during cutscenes
let inCutscene = false;             // holds if player is in cutscene
let hud;                            // holds HUD background
let hudComponents = [];             // holds all components of HUD
let hudScale = .75;                 // scale of HUD overlay
let masterVolume = 1;               // holds master volume (-5, 5)
let soundEffects = [];              // holds all sound effects
let musicVolume = 1;                // holds music volume (-5, 5)
let musicEffects = [];              // holds all music effects
let healthBar;                      // holds health bar object
let xpBar;                          // holds xp bar object
let menuComponents = [];            // holds components of menu
let settingsComponents = [];        // holds components of settings
let hudIcons = [];                  // holds icons on HUD
let inventory = [[]];               // holds inventory
let inventoryComponents = [];       // holds inventory components
let inventorySlots = [[]];          // holds inventory slots
let pathNodes = [[]];               // holds path nodes for enemy pathfinding
let triangles = [[]];               // holds triangles for diagonal collision
let player;                         // holds player
let lastPlayerX;                    // holds player's last x position
let lastPlayerY;                    // holds player's last y position
let enemies = [];                   // holds enemies
let activeScene = null;             // holds the current scene
let activeSceneKey = null;          // holds the current scene's key
let map = null;                     // holds current tilemap
let playerAttacks = [];             // holds player's attack objects
let enemyAttacks = [];              // holds enemies' attack objects
let projectiles = [];               // holds all projectile objects
let groundItems = [];               // holds all ground items
let chests = [];                    // holds all chests
let inCutsceneTween = false;        // true when tweening cutscenes
let watchedCutscene1 = false;       // true if watched cutscene 1
let newGame = false;                // true if new game
let enableHitboxes = false;         // controls if attack hitboxes are shown

// data for save file
let saveName = 'saveData';          // holds name of saved data
let playerClass = 'warrior';        // holds player's class
let playerLevel = 1;                // holds player's level
let playerXP = 0;                   // holds player's xp
let secretUnlocked = false;          // hold if secret character has been unlocked

// reserve keyboard vars
let keyW, keyA, keyS, keyD, keyUP, keyLEFT, keyDOWN, keyRIGHT, keyENTER, keyESCAPE, keySPACE, keyE, keyC, key1, key2, key3, key4;

// global functions
function addTriangles() {
    triangles = [[]];
    for (var r = 0; r < map.height; r++) {
        triangles.push([]);
        for (var c = 0; c < map.width; c++) {
            triangles[r].push(0);
            var tile = map.getTileAt(c, r);
            if (tile.properties.corner) {
                var x = tile.x * tile.width;
                var y = tile.y * tile.height;
                switch(tile.properties.direction) {
                    case 0: triangles[r][c] = new Phaser.Geom.Triangle(x, y + tile.width, x + tile.width, y + tile.width, x + tile.width, y); break;
                    case 1: triangles[r][c] = new Phaser.Geom.Triangle(x, y + tile.width, x + tile.width, y + tile.width, x, y); break;
                    case 2: triangles[r][c] = new Phaser.Geom.Triangle(x, y, x + tile.width, y + tile.width, x + tile.width, y); break;
                    case 3: triangles[r][c] = new Phaser.Geom.Triangle(x, y + tile.width, x, y, x + tile.width, y); break;
                }
            }
        }
    }
}

function reset() {
    chests = [];
    soundEffects = [];
    musicEffects = [];
    groundItems = [];
    player = undefined;
    enemies = [];
    projectiles = [];
    if(map != undefined) {
        map.destroy();
    }
}

function diagonalCollision(object1, object2) {
    var tile = map.getTileAt(object2.x, object2.y);
    var circle = new Phaser.Geom.Circle(object1.x, object1.y, object1.body.radius);
    var out = [];
    if(tile.properties.corner == true) {
        Phaser.Geom.Intersects.GetTriangleToCircle(triangles[object2.y][object2.x], circle, out);
        if (out.length > 0) {
            if(out.length > 1) {
                separate(object1, out, true);
            }
            return true;
        } else {
            return false;
        }
    } else if (tile.properties.walkable == false){
        var rect = new Phaser.Geom.Rectangle(tile.x * tile.width, tile.y * tile.height, tile.width, tile.height);
        Phaser.Geom.Intersects.GetCircleToRectangle(circle, rect, out);
        if (out.length > 0) {
            if (out.length > 1) {
                separate(object1, out, false);
            }
            return false;
        } else {
            return false;
        }
    } else {
        return true;
    }
}

function separate(object, intersections, diagonal) {
    var x1 = intersections[0].x - object.x;
    var y1 = intersections[0].y - object.y;
    var x2 = intersections[1].x - object.x;
    var y2 = intersections[1].y - object.y;
    var midX = (x1 + x2) / 2;
    var midY = (y1 + y2) / 2;
    var v1 = new Phaser.Math.Vector2(midX, midY);
    
    var scale;
    var mult1 = 0.00075;//0.000484;
    var mult2 = 0.0005;//0.000337;
    if (object.body.velocity.x != 0 && object.body.velocity.y != 0) {
        if(diagonal) {
            if (Math.abs(object.body.velocity.x) > Math.abs(object.body.velocity.y)) {
                scale = Math.abs(object.body.velocity.x * mult1 / diagonalSpeed);
            } else {
                scale = Math.abs(object.body.velocity.y * mult1 / diagonalSpeed);
            }
        } else {
            if (Math.abs(object.body.velocity.x) > Math.abs(object.body.velocity.y)) {
                scale = Math.abs(object.body.velocity.x * mult2 / diagonalSpeed);
            } else {
                scale = Math.abs(object.body.velocity.y * mult2 / diagonalSpeed);
            }
        }
    } else {
        if (diagonal) {
            if (Math.abs(object.body.velocity.x) > Math.abs(object.body.velocity.y)) {
                scale = Math.abs(object.body.velocity.x * mult2);
            } else {
                scale = Math.abs(object.body.velocity.y * mult2);
            }
        } else {
            if (Math.abs(object.body.velocity.x) > Math.abs(object.body.velocity.y)) {
                scale = Math.abs(object.body.velocity.x * mult1);
            } else {
                scale = Math.abs(object.body.velocity.y * mult1);
            }
        }
    }

    var v2 = v1.scale(scale);
    object.body.position.subtract(v2);
}

function getClosestNode(object) {
    var node = getNodeIn(object);
    if(node != 0) {
        return node;
    }
    var closestR = 0;
    var closestC = 0;
    for (var r = 0; r < map.height; r++) {
        for (var c = 0; c < map.width; c++) {
            var tile = map.getTileAt(c, r);
            if (tile.properties.walkable) {
                if (Math.abs(object.x - pathNodes[r][c].x) <= Math.abs(object.x - pathNodes[closestR][closestC].x) && Math.abs(object.y - pathNodes[r][c].y) <= Math.abs(object.y - pathNodes[closestR][closestC].y)) {
                    closestR = r;
                    closestC = c;
                }
            }
        }
    }
    return pathNodes[closestR][closestC];
}

function getNodeIn(object){
    var tile = map.getTileAtWorldXY(object.x,object.y);
    return pathNodes[tile.y][tile.x];
}

function snapToNode(object){
    var node = getNodeIn(object);
    object.setPosition(node.x, node.y);
}

function moveToNode(object) {
    var node = getNodeIn(object);
    object.movingToNode = true;
    activeScene.tweens.add({
        targets: object,
        x: node.x,
        y: node.y,
        duration: 500,
        ease: 'Power2',
        onComplete: function () { 
            object.movingToNode = false;
        },
    });
}

function generatePathNodes() {
    pathNodes = [[]];
    for (var r = 0; r < map.height; r++) {
        pathNodes.push([]);
        for (var c = 0; c < map.width; c++) {
            pathNodes[r].push(0);
            var tile = map.getTileAt(c, r);
            if(tile.properties.walkable) {
                spawnPathNode(tile);
            }
        }
    }
    for (var r = 0; r < map.height; r++) {
        for (var c = 0; c < map.width; c++) {
            var tile = map.getTileAt(c, r);
            if (tile.properties.walkable) {
                // above 
                if (r - 1 >= 0 && map.getTileAt(c, r - 1).properties.walkable) {
                    pathNodes[r][c].neighbors.push(pathNodes[r - 1][c]);
                }
                // below 
                if (r + 1 < map.height && map.getTileAt(c, r + 1).properties.walkable) {
                    pathNodes[r][c].neighbors.push(pathNodes[r + 1][c]);
                }
                // left
                if (c - 1 >= 0 && map.getTileAt(c - 1, r).properties.walkable) {
                    pathNodes[r][c].neighbors.push(pathNodes[r][c - 1]);
                }
                // right
                if (c + 1 < map.width && map.getTileAt(c + 1, r).properties.walkable) {
                    pathNodes[r][c].neighbors.push(pathNodes[r][c + 1]);
                }
                // above, left
                if (r - 1 >= 0 && c - 1 >= 0 && map.getTileAt(c - 1, r - 1).properties.walkable && (map.getTileAt(c, r - 1).properties.walkable || map.getTileAt(c, r - 1).properties.corner) && (map.getTileAt(c - 1, r).properties.walkable || map.getTileAt(c - 1, r).properties.corner)) {
                    pathNodes[r][c].neighbors.push(pathNodes[r - 1][c - 1]);
                }
                // above, right
                if (r - 1 >= 0 && c + 1 < map.width && map.getTileAt(c + 1, r - 1).properties.walkable && (map.getTileAt(c, r - 1).properties.walkable || map.getTileAt(c, r - 1).properties.corner) && (map.getTileAt(c + 1, r).properties.walkable || map.getTileAt(c + 1, r).properties.corner)) {
                    pathNodes[r][c].neighbors.push(pathNodes[r - 1][c + 1]);
                }
                // below, left
                if (r + 1 < map.height && c - 1 >= 0 && map.getTileAt(c - 1, r + 1).properties.walkable && (map.getTileAt(c, r + 1).properties.walkable || map.getTileAt(c, r + 1).properties.corner) && (map.getTileAt(c - 1, r).properties.walkable || map.getTileAt(c - 1, r).properties.corner)) {
                    pathNodes[r][c].neighbors.push(pathNodes[r + 1][c - 1]);
                }
                // below, right
                if (r + 1 < map.height && c + 1 < map.width && map.getTileAt(c + 1, r + 1).properties.walkable && (map.getTileAt(c, r + 1).properties.walkable || map.getTileAt(c, r + 1).properties.corner) && (map.getTileAt(c + 1, r).properties.walkable || map.getTileAt(c + 1, r).properties.corner)) {
                    pathNodes[r][c].neighbors.push(pathNodes[r + 1][c + 1]);
                }
            }
        }
    }
}

function spawnPathNode(tile) {
    pathNodes[tile.y][tile.x] = new PathNode(tile.x * tile.width + tile.width/2, tile.y * tile.height + tile.height/2, 'pathNode');
}

function spawnChest(x,y) {
    x = x * 80 + 40;
    y = y * 80 + 40;
    var c = new Chest(x, y);
    chests.push(c);
}

function spawnSlime(x, y, target, tutorialMob) {
    if(tutorialMob == undefined){
        tutorialMob = false;
    }
    x = x * 80 + 40;
    y = y * 80 + 40;
    var e = new Slime(x, y, target, tutorialMob);
    snapToNode(e);
    enemies.push(e);
}

function spawnBear(x, y, target) {
    x = x * 80 + 40;
    y = y * 80 + 40;
    var e = new Bear(x, y, target);
    snapToNode(e);
    enemies.push(e);
}

function spawnWisp(x, y, target) {
    x = x * 80 + 40;
    y = y * 80 + 40;
    var e = new Wisp(x, y, target);
    snapToNode(e);
    enemies.push(e);
}

function saveGame() {
    var items = [[]];
    var quantities = [[]];
    var levels = [[]];
    for(var r = 0; r < 5; r++) {
        items.push([]);
        quantities.push([]);
        levels.push([]);
        for (var c = 0; c < 11; c++) {
            if (inventory[r] != undefined && inventory[r][c] != undefined) {
                items[r].push(inventory[r][c].item);
                quantities[r].push(inventory[r][c].quantity);
                levels[r].push(inventory[r][c].level);
            } else {
                items[r].push(undefined);
                quantities[r].push(undefined);
                levels[r].push(undefined);
            }
        }
    }
    items.push([]);
    quantities.push([]);
    levels.push([]);
    if (inventory[5] != undefined && inventory[5][0] != undefined) {
        items[5].push(inventory[5][0].item);
        quantities[5].push(inventory[5][0].quantity);
        levels[5].push(inventory[5][0].level);
    } else {
        items[5].push(undefined);
        quantities[5].push(undefined);
        levels[5].push(undefined);
    }
    if (inventory[5] != undefined && inventory[5][1] != undefined) {
        items[5].push(inventory[5][1].item);
        quantities[5].push(inventory[5][1].quantity);
        levels[5].push(inventory[5][1].level);
    } else {
        items[5].push(undefined);
        quantities[5].push(undefined);
        levels[5].push(undefined);
    }
    if (inventory[5] != undefined && inventory[5][2] != undefined) {
        items[5].push(inventory[5][2].item);
        quantities[5].push(inventory[5][2].quantity);
        levels[5].push(inventory[5][2].level);
    } else {
        items[5].push(undefined);
        quantities[5].push(undefined);
        levels[5].push(undefined);
    }
    var file = {
        class: playerClass,
        playerLevel: playerLevel,
        playerXP: playerXP,
        level: activeSceneKey,
        secret: secretUnlocked,
        cutscene1: watchedCutscene1,
        items: items,
        quantities: quantities,
        levels: levels,
    };
    localStorage.setItem(saveName, JSON.stringify(file));
}

function loadGame() {
    var file = JSON.parse(localStorage.getItem(saveName));
    playerClass = file.class;
    playerLevel = file.playerLevel;
    playerXP = file.playerXP;
    secretUnlocked = file.secret;
    watchedCutscene1 = file.cutscene1;
    activeScene.scene.start(file.level);
}

function loadInventory() {
    var file = JSON.parse(localStorage.getItem(saveName));
    for (var r = 0; r < 5; r++) {
        for (var c = 0; c < 11; c++) {
            if (file.items[r][c] != null) {
                createItem(file.items[r][c], getType(file.items[r][c]), file.quantities[r][c], r, c, false, file.levels[r][c]);
            }
        }
    }
    if (file.items[5][0] != null) {
        createItem(file.items[5][0], getType(file.items[5][0]), file.quantities[5][0], 5, 0, false, file.levels[5][0]);
    }
    if (file.items[5][1] != null) {
        createItem(file.items[5][1], getType(file.items[5][1]), file.quantities[5][1], 5, 1, false, file.levels[5][1]);
    }
    if (file.items[5][2] != null) {
        createItem(file.items[5][2], getType(file.items[5][2]), file.quantities[5][2], 5, 2, false, file.levels[5][2]);
    }
}

function saveVolumes() {
    var file = {
        masterVolume: masterVolume,
        musicVolume: musicVolume,
    };
    localStorage.setItem('volumes', JSON.stringify(file));
}


function loadVolumes() {
    if(volumeFileExists()) {
        var file = JSON.parse(localStorage.getItem('volumes'));
        masterVolume = file.masterVolume;
        musicVolume  = file.musicVolume;
    }
}

function removeGame() {
    localStorage.removeItem(saveName);
}

function fileExists() {
    var file = JSON.parse(localStorage.getItem(saveName));
    return file != null;
}

function volumeFileExists() {
    var file = JSON.parse(localStorage.getItem('volumes'));
    return file != null;
}

function projectileTerrainCollision(object) {
    var borderForgiveness = 10;
    if(object.x < 0 - borderForgiveness || object.x > activeScene.physics.world.bounds.width + borderForgiveness || object.y < 0 - borderForgiveness || object.y > activeScene.physics.world.bounds.height + borderForgiveness) {
        return true;
    }
    var tile = map.getTileAtWorldXY(object.x, object.y);
    return tile != null && tile.properties.projectileCanCollide;
}

function circleToRotatedRectOverlap(circleX, circleY, circleRadius, rectWidth, rectHeight, rectCenterX, rectCenterY, rectAngle) {
    // function code adapted from http://www.migapro.com/circle-and-rotated-rectangle-collision-detection/
    // Rotate circle's center point back
    var rectX = rectCenterX - rectWidth/2;
    var rectY = rectCenterY - rectHeight/2;
    var unrotatedCircleX = Math.cos(rectAngle) * (circleX - rectCenterX) -
        Math.sin(rectAngle) * (circleY - rectCenterY) + rectCenterX;
    var unrotatedCircleY = Math.sin(rectAngle) * (circleX - rectCenterX) +
        Math.cos(rectAngle) * (circleY - rectCenterY) + rectCenterY;

    // Closest point in the rectangle to the center of circle rotated backwards(unrotated)
    var closestX, closestY;

    // Find the unrotated closest x point from center of unrotated circle
    if (unrotatedCircleX < rectX) {
        closestX = rectX;
    } else if (unrotatedCircleX > rectX + rectWidth) {
        closestX = rectX + rectWidth;
    } else {
        closestX = unrotatedCircleX;
    }
    // Find the unrotated closest y point from center of unrotated circle
    if (unrotatedCircleY < rectY) {
        closestY = rectY;
    } else if (unrotatedCircleY > rectY + rectHeight) {
        closestY = rectY + rectHeight;
    } else {
        closestY = unrotatedCircleY;
    }
    // Determine collision
    var distance = findDistance(unrotatedCircleX, unrotatedCircleY, closestX, closestY);
    return distance < circleRadius;
}

function findDistance(fromX, fromY, toX, toY) {
    var a = Math.abs(fromX - toX);
    var b = Math.abs(fromY - toY);
    return Math.sqrt((a * a) + (b * b));
}

function loadPlayerSpritesheets(scene) {
    scene.load.image('menu', 'assets/Menu.png');
    scene.load.image('menu_button', 'assets/Menu_Button.png');
    scene.load.image('hud', 'assets/HUD.png');
    scene.load.image('inventory', 'assets/Inventory.png');
    scene.load.image('inventory_slot', 'assets/inventory_slot.png');
    scene.load.image('bag_icon', 'assets/inventory_icon.png');
    scene.load.image('health_potion_icon', 'assets/health_potion_icon.png');
    scene.load.image('key_icon', 'assets/key_icon.png');
    scene.load.image('coin_icon', 'assets/coin.png');
    scene.load.image('rogue_weapon_icon', 'assets/crossbow_icon.png');
    scene.load.image('warrior_weapon_icon', 'assets/sword_icon.png');
    scene.load.image('mage_weapon_icon', 'assets/staff_icon.png');
    scene.load.image('warrior_armor_icon', 'assets/warrior_armor_icon.png');
    scene.load.image('rogue_armor_icon', 'assets/rogue_armor_icon.png');
    scene.load.image('mage_armor_icon', 'assets/mage_armor_icon.png');
    scene.load.image('cutscene_bar', 'assets/CutsceneBar.png');
    scene.load.image('info_panel', 'assets/infoPanel.png');
    scene.load.image('volume_tab', 'assets/VolumeTab.png');

    scene.load.image('chest_closed', 'assets/chest_closed.png');
    scene.load.image('chest_opened', 'assets/chest_opened.png');

    scene.load.image('warrior_talking', 'assets/warrior_talking.png');
    scene.load.image('rogue_talking', 'assets/rogue_talking.png');
    scene.load.image('mage_talking', 'assets/mage_talking.png');
    scene.load.image('necromancer_talking', 'assets/necromancer_talking.png');
    scene.load.image('priest_talking', 'assets/priest_talking.png');
    scene.load.image('shopkeep_talking', 'assets/shopkeep_talking.png');
    scene.load.image('boss_talking', 'assets/boss_talking.png');

    scene.load.spritesheet('warrior_walking', './assets/warrior/warrior_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('warrior_idle', './assets/warrior/warrior_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('warrior_basic', './assets/warrior/warrior_basic.png', { frameWidth: 80, frameHeight: 240, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('warrior_ground_slam', './assets/warrior/warrior_ground_slam.png', { frameWidth: 160, frameHeight: 160, startFrame: 0, endFrame: 2 });
    scene.load.spritesheet('warrior_charge', './assets/warrior/warrior_charge.png', { frameWidth: 160, frameHeight: 320, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('warrior_whirlwind', './assets/warrior/warrior_whirlwind.png', { frameWidth: 80, frameHeight: 320, startFrame: 0, endFrame: 0 });
    scene.load.image('warrior_icon_0', 'assets/skills/warrior/ground_slam_ability.png');
    scene.load.image('warrior_icon_1', 'assets/skills/warrior/charge_ability.png');
    scene.load.image('warrior_icon_2', 'assets/skills/warrior/whirlwind_ability.png');
    scene.load.image('warrior_icon_3', 'assets/skills/warrior/battlecry_ability.png');

    scene.load.spritesheet('rogue_walking', './assets/rogue/rogue_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('rogue_idle', './assets/rogue/rogue_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('rogue_basic', './assets/rogue/rogue_basic.png', { frameWidth: 80, frameHeight: 160, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('rogue_backstab', './assets/rogue/rogue_backstab.png', { frameWidth: 240, frameHeight: 160, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('rogue_flurry', './assets/rogue/rogue_flurry.png', { frameWidth: 160, frameHeight: 80, startFrame: 0, endFrame: 0 });
    scene.load.image('arrow', 'assets/rogue/projectile_arrow.png');
    scene.load.image('shuriken', 'assets/rogue/projectile_shuriken.png');
    scene.load.image('slash', 'assets/rogue/effect_slash.png');
    scene.load.image('rogue_icon_0', 'assets/skills/rogue/backstab_ability.png');
    scene.load.image('rogue_icon_1', 'assets/skills/rogue/lockpick_ability.png');
    scene.load.image('rogue_icon_2', 'assets/skills/rogue/stealth_ability.png');
    scene.load.image('rogue_icon_3', 'assets/skills/rogue/flurry_ability.png');
    
    scene.load.spritesheet('mage_walking', './assets/mage/mage_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('mage_idle', './assets/mage/mage_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('mage_basic', './assets/mage/mage_basic.png', { frameWidth: 80, frameHeight: 160, startFrame: 0, endFrame: 1 });
    scene.load.image('fireball', 'assets/mage/projectile_fireball.png');
    scene.load.image('cast_fireball', 'assets/mage/cast_fireball.png');
    scene.load.image('fireball_explosion', 'assets/mage/effect_fireball_explosion.png');
    scene.load.image('lightning', 'assets/mage/effect_lightning.png');
    scene.load.image('cast_lightning', 'assets/mage/cast_lightning.png');
    scene.load.image('frozen', 'assets/mage/effect_frozen.png');
    scene.load.image('cast_freeze', 'assets/mage/cast_freeze.png');
    scene.load.image('meteor', 'assets/mage/effect_meteor.png');
    scene.load.image('cast_meteor', 'assets/mage/cast_meteor.png');
    scene.load.image('meteor_explosion', 'assets/mage/effect_meteor_explosion.png');
    scene.load.image('mage_icon_0', 'assets/skills/mage/fireball_ability.png');
    scene.load.image('mage_icon_1', 'assets/skills/mage/lightning_ability.png');
    scene.load.image('mage_icon_2', 'assets/skills/mage/freeze_ability.png');
    scene.load.image('mage_icon_3', 'assets/skills/mage/meteor_ability.png');
    
    scene.load.spritesheet('necromancer_walking', './assets/necromancer/necromancer_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('necromancer_idle', './assets/necromancer/necromancer_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('necromancer_basic', './assets/necromancer/necromancer_basic.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.image('void_bolt', 'assets/necromancer/projectile_void.png');
    scene.load.image('necromancer_icon_0', 'assets/skills/necromancer/drain_ability.png');
    scene.load.image('necromancer_icon_1', 'assets/skills/necromancer/animate_dead_ability.png');
    scene.load.image('necromancer_icon_2', 'assets/skills/necromancer/curse_ability.png');
    scene.load.image('necromancer_icon_3', 'assets/skills/necromancer/fear_ability.png');
}

function createPlayerAnimations() {
    var walkFrameRate = 4;

    // Warrior Animations
    activeScene.anims.create({
        key: 'warrior_walking',
        frames: activeScene.anims.generateFrameNumbers('warrior_walking', { start: 0, end: 1, first: 0 }),
        frameRate: walkFrameRate,
    });
    activeScene.anims.create({
        key: 'warrior_idle',
        frames: activeScene.anims.generateFrameNumbers('warrior_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'warrior_basic',
        frames: activeScene.anims.generateFrameNumbers('warrior_basic', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'warrior_ground_slam',
        frames: activeScene.anims.generateFrameNumbers('warrior_ground_slam', { start: 0, end: 2, first: 0 }),
        frameRate: 4,
    });
    activeScene.anims.create({
        key: 'warrior_charge',
        frames: activeScene.anims.generateFrameNumbers('warrior_charge', { start: 0, end: 1, first: 0 }),
        frameRate: 8,
    });
    activeScene.anims.create({
        key: 'warrior_whirlwind',
        frames: activeScene.anims.generateFrameNumbers('warrior_whirlwind', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'warrior_ability_0',
        frames: activeScene.anims.generateFrameNumbers('warrior_ground_slam', { start: 0, end: 2, first: 2 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'warrior_ability_1',
        frames: activeScene.anims.generateFrameNumbers('warrior_charge', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'warrior_ability_2',
        frames: activeScene.anims.generateFrameNumbers('warrior_whirlwind', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'warrior_ability_3',
        frames: activeScene.anims.generateFrameNumbers('warrior_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });

    // Rogue Animations
    activeScene.anims.create({
        key: 'rogue_walking',
        frames: activeScene.anims.generateFrameNumbers('rogue_walking', { start: 0, end: 1, first: 0 }),
        frameRate: walkFrameRate,
    });
    activeScene.anims.create({
        key: 'rogue_idle',
        frames: activeScene.anims.generateFrameNumbers('rogue_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'rogue_basic',
        frames: activeScene.anims.generateFrameNumbers('rogue_basic', { start: 0, end: 1, first: 0 }),
        frameRate: 4,
    });
    activeScene.anims.create({
        key: 'rogue_backstab',
        frames: activeScene.anims.generateFrameNumbers('rogue_backstab', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'rogue_flurry',
        frames: activeScene.anims.generateFrameNumbers('rogue_flurry', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'rogue_ability_0',
        frames: activeScene.anims.generateFrameNumbers('rogue_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'rogue_ability_1',
        frames: activeScene.anims.generateFrameNumbers('rogue_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'rogue_ability_2',
        frames: activeScene.anims.generateFrameNumbers('rogue_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'rogue_ability_3',
        frames: activeScene.anims.generateFrameNumbers('rogue_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });

    // Mage Animations
    activeScene.anims.create({
        key: 'mage_walking',
        frames: activeScene.anims.generateFrameNumbers('mage_walking', { start: 0, end: 1, first: 0 }),
        frameRate: walkFrameRate,
    });
    activeScene.anims.create({
        key: 'mage_idle',
        frames: activeScene.anims.generateFrameNumbers('mage_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'mage_basic',
        frames: activeScene.anims.generateFrameNumbers('mage_basic', { start: 0, end: 1, first: 0 }),
        frameRate: 4,
    });
    activeScene.anims.create({
        key: 'mage_attack',
        frames: activeScene.anims.generateFrameNumbers('mage_basic', { start: 0, end: 1, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'mage_ability_0',
        frames: activeScene.anims.generateFrameNumbers('mage_basic', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'mage_ability_1',
        frames: activeScene.anims.generateFrameNumbers('mage_basic', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'mage_ability_2',
        frames: activeScene.anims.generateFrameNumbers('mage_basic', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'mage_ability_3',
        frames: activeScene.anims.generateFrameNumbers('mage_basic', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });

    // Necromancer Animations
    activeScene.anims.create({
        key: 'necromancer_walking',
        frames: activeScene.anims.generateFrameNumbers('necromancer_walking', { start: 0, end: 1, first: 0 }),
        frameRate: walkFrameRate,
    });
    activeScene.anims.create({
        key: 'necromancer_idle',
        frames: activeScene.anims.generateFrameNumbers('necromancer_idle', { start: 0, end: 0, first: 0 }),
        frameRate: 0,
    });
    activeScene.anims.create({
        key: 'necromancer_basic',
        frames: activeScene.anims.generateFrameNumbers('necromancer_basic', { start: 0, end: 1, first: 0 }),
        frameRate: 4,
    });
}

function loadPlayerSounds(scene) {
    scene.load.audio('chest', './assets/Chest.mp3');

    scene.load.audio('walk', './assets/Running.mp3');
    scene.load.audio('sword_swing', './assets/SwordSwing.mp3');
    scene.load.audio('thud', './assets/Thud.mp3');
    scene.load.audio('ground_slam', './assets/GroundSlam.mp3');
    scene.load.audio('battlecry', './assets/Battlecry.mp3');

    scene.load.audio('arrow_shot', './assets/ArrowShot.wav');
    scene.load.audio('backstab', './assets/Backstab.mp3');
    scene.load.audio('lockpick', './assets/Lockpick.mp3');
    scene.load.audio('stealth', './assets/Stealth.mp3');
    scene.load.audio('flurry', './assets/Flurry.mp3');

    scene.load.audio('staff_hit', './assets/MageAutoAttack.mp3');
    scene.load.audio('fireball', './assets/Fireball.mp3');
    scene.load.audio('lightning', './assets/LightningBolt.mp3');
    scene.load.audio('freeze', './assets/Freeze.mp3');
    scene.load.audio('meteor', './assets/Meteor.mp3');
    scene.load.audio('explosion', './assets/Explosion.wav');
}

function createPlayerSounds() {
    soundEffects = [];
    musicEffects = [];
    activeScene.walkSound = activeScene.sound.add('walk', {
        rate: 1,
        volume: 2,
        loop: true
    });
    soundEffects.push(activeScene.walkSound);
    activeScene.swordSwing = activeScene.sound.add('sword_swing', {
        rate: 1,
        volume: .75,
        loop: false
    });
    soundEffects.push(activeScene.swordSwing);
    activeScene.groundSlam = activeScene.sound.add('ground_slam', {
        rate: 1.5,
        volume: .25,
        loop: false
    });
    soundEffects.push(activeScene.groundSlam);
    activeScene.charge = activeScene.sound.add('walk', {
        rate: 2,
        volume: 4,
        loop: true
    });
    soundEffects.push(activeScene.charge);
    activeScene.thud = activeScene.sound.add('thud', {
        rate: .25,
        volume: 2,
        loop: false
    });
    soundEffects.push(activeScene.thud);
    activeScene.whirlwind = activeScene.sound.add('sword_swing', {
        rate: 2,
        volume: 1,
        loop: false
    });
    soundEffects.push(activeScene.whirlwind);
    activeScene.battlecry = activeScene.sound.add('battlecry', {
        rate: 2.5,
        volume: .25,
        loop: false
    });
    soundEffects.push(activeScene.battlecry);
    activeScene.arrowShot = activeScene.sound.add('arrow_shot', {
        rate: 1.5,
        volume: .75,
        loop: false
    });
    soundEffects.push(activeScene.arrowShot);
    activeScene.backstab = activeScene.sound.add('backstab', {
        rate: 1,
        volume: 3,
        loop: false
    });
    soundEffects.push(activeScene.backstab);
    activeScene.lockpick = activeScene.sound.add('lockpick', {
        rate: 1,
        volume: 1,
        loop: false
    });
    soundEffects.push(activeScene.lockpick);
    activeScene.stealth = activeScene.sound.add('stealth', {
        rate: 2,
        volume: .5,
        loop: false
    });
    soundEffects.push(activeScene.stealth);
    activeScene.flurry = activeScene.sound.add('flurry', {
        rate: 1,
        volume: .75,
        loop: false
    });
    soundEffects.push(activeScene.flurry);
    activeScene.staffHit = activeScene.sound.add('staff_hit', {
        rate: 1.5,
        volume: .5,
        loop: false
    });
    soundEffects.push(activeScene.staffHit);
    activeScene.fireball = activeScene.sound.add('fireball', {
        rate: 1.2,
        volume: .75,
        loop: false
    });
    soundEffects.push(activeScene.fireball);
    activeScene.lightning = activeScene.sound.add('lightning', {
        rate: 1,
        volume: .5,
        loop: false
    });
    soundEffects.push(activeScene.lightning);
    activeScene.freeze = activeScene.sound.add('freeze', {
        rate: 2,
        volume: .4,
        loop: false
    });
    soundEffects.push(activeScene.freeze);
    activeScene.meteor = activeScene.sound.add('meteor', {
        rate: 2,
        volume: .75,
        loop: false
    });
    soundEffects.push(activeScene.meteor);
    activeScene.fireballExplosion = activeScene.sound.add('explosion', {
        rate: 1,
        volume: 1,
        loop: false
    });
    soundEffects.push(activeScene.fireballExplosion);
    activeScene.meteorExplosion = activeScene.sound.add('explosion', {
        rate: .5,
        volume: 2,
        loop: false
    });
    soundEffects.push(activeScene.meteorExplosion);
    activeScene.chest = activeScene.sound.add('chest', {
        rate: 1,
        volume: 2,
        loop: false
    });
    soundEffects.push(activeScene.chest);
}

function createVolumes() {
    for (var i = 0; i < soundEffects.length; i++) {
        soundEffects[i].original = soundEffects[i].config.volume;
    }
    for (var i = 0; i < musicEffects.length; i++) {
        musicEffects[i].original = musicEffects[i].config.volume;
    }
}

function updateMasterVolume(){
    for(var i = 0; i < soundEffects.length; i++) {
        soundEffects[i].setVolume(soundEffects[i].original * masterVolume);
    }
    saveVolumes();
}

function updateMusicVolume() {
    for (var i = 0; i < musicEffects.length; i++) {
        musicEffects[i].setVolume(musicEffects[i].original * musicVolume);
    }
    saveVolumes();
}

function createInfoPanel(x, y, item, type, level, r, c) {
    var panel = activeScene.add.sprite(x, y, 'info_panel').setOrigin(0.5).setScrollFactor(0);
    panel.depth = 5;
    panel.header = activeScene.add.text(x, y - 120, getName(item, level), { font: "35px Gothic", fill: "#808080", align: 'center', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0);
    panel.header.depth = 5;
    panel.icon = activeScene.add.sprite(x, y - 40, item + '_icon').setOrigin(0.5).setScrollFactor(0);
    panel.icon.depth = 5;
    panel.icon.setScale(1.4);
    panel.type = activeScene.add.text(x, y + 35, 'Type: ' + getTypeName(type), { font: "25px Gothic", fill: "#000000", align: 'center' }).setOrigin(0.5).setScrollFactor(0);
    panel.type.depth = 5;
    panel.description = activeScene.add.text(x, y + 95, getDescription(item, level), { font: "25px Gothic", fill: "#000000", align: 'center' }).setOrigin(0.5).setScrollFactor(0);
    panel.description.depth = 5;
    panel.r = r;
    panel.c = c;
    setInfoPanelActive(panel, false);
    return panel;
}

function setInfoPanelActive(infoPanel, active) {
    infoPanel.visible = active;
    infoPanel.header.visible = active;
    infoPanel.icon.visible = active;
    infoPanel.type.visible = active;
    infoPanel.description.visible = active;

    if(active) {
        var x = inventory[infoPanel.r][infoPanel.c].x;
        var y = inventory[infoPanel.r][infoPanel.c].y;
        if (infoPanel.c > 5) {
            x -= 180;
        } else {
            x += 180;
        }
        if (infoPanel.r == 0) {
            y += 90;
        } else if(infoPanel.r >= 4){
            y -= 90;
        }
        infoPanel.x = x;
        infoPanel.y = y;
        infoPanel.header.x = x;
        infoPanel.header.y = y - 120;
        infoPanel.icon.x = x;
        infoPanel.icon.y = y - 40;
        infoPanel.type.x = x;
        infoPanel.type.y = y + 35;
        infoPanel.description.x = x;
        infoPanel.description.y = y + 95;
    }
}

function destroyInfoPanel(infoPanel) {
    infoPanel.header.destroy();
    infoPanel.icon.destroy();
    infoPanel.type.destroy();
    infoPanel.description.destroy();
    infoPanel.destroy();
}

function updateAttackAndHealth() {
    if (inventory[5][0] != undefined) {
        player.attack = playerAttack + weaponValue(inventory[5][0].level);
    } else {
        player.attack = playerAttack;
    }
    if (inventory[5][1] != undefined) {
        player.bufferHealth = armorValue(inventory[5][1].level);
    } else {
        player.bufferHealth = 0;
        if (player.health <= 0) {
            player.health = 1;
        }
    }
    updateHealthBar();
}

function createItem(item, type, quantity, row, column, visible, level) {
    inventory[row][column] = activeScene.add.sprite(inventorySlots[row][column].x, inventorySlots[row][column].y, item + '_icon').setScrollFactor(0).setInteractive({
        draggable: true
    });
    inventory[row][column].item = item;
    inventory[row][column].type = type;
    inventory[row][column].quantity = quantity;
    inventory[row][column].visible = visible;
    if(level == undefined) {
        level = 1;
    }
    inventory[row][column].level = level;
    var offsetX = 25;
    var offsetY = 25;
    if(quantity > 1) { 
        inventory[row][column].quantityText = activeScene.add.text(inventorySlots[row][column].x + offsetX, inventorySlots[row][column].y + offsetY, quantity, { font: 25 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0);
        inventory[row][column].quantityText.depth = 4;
        inventory[row][column].quantityText.visible = visible;
    }
    if(row == 5 && column == 2) {
        hudIcons[1].setTexture(inventory[row][column].texture);
    }
    updateAttackAndHealth();
    inventory[row][column].depth = 4;
    inventory[row][column].infoPanel = createInfoPanel(inventory[row][column].x, inventory[row][column].y, item, type, level, row, column);
    inventory[row][column].hover = inventory[row][column].on('pointerover', function (pointer) {
        setInfoPanelActive(inventory[row][column].infoPanel, true);
    });
    inventory[row][column].hoverOut = inventory[row][column].on('pointerout', function (pointer) {
        setInfoPanelActive(inventory[row][column].infoPanel, false);
    });
    inventory[row][column].drag = inventory[row][column].on('drag', (pointer, dragX, dragY) => {
        inventory[row][column].depth = 5;
        if(quantity > 1){
            inventory[row][column].quantityText.depth = 5;
        }
        setInfoPanelActive(inventory[row][column].infoPanel, false);
        inventory[row][column].x = dragX;
        inventory[row][column].y = dragY;
        if (inventory[row][column].quantityText != undefined) {
            inventory[row][column].quantityText.x = dragX + offsetX;
            inventory[row][column].quantityText.y = dragY + offsetY;
        }
    });
    inventory[row][column].drop = inventory[row][column].on('drop', (pointer, target) => {
        inventory[row][column].depth = 4;
        if (quantity > 1) {
            inventory[row][column].quantityText.depth = 4;
        }
        var rowCol = findRowCol(target);
        var r = rowCol[0];
        var c = rowCol[1];
        setInfoPanelActive(inventory[row][column].infoPanel, false);
        if (r == 5 && c == 0 && inventory[row][column].type != 'weapon') {
            return;
        } 
        if (r == 5 && c == 1 && inventory[row][column].type != 'armor') {
            return;
        }
        if (r == 5 && c == 2 && inventory[row][column].type != 'item') {
            return;
        }
        var old = [inventory[row][column].item, inventory[row][column].type, inventory[row][column].quantity, inventory[row][column].level];
        if (row == 5 && column == 2) {
            hudIcons[1].setTexture('inventory_slot');
        }
        destroyItem(row,column);
        if (inventory[r][c] != undefined) {
            var old2 = [inventory[r][c].item, inventory[r][c].type, inventory[r][c].quantity, inventory[r][c].level];
            destroyItem(r, c);
            if (old[0] == old2[0] && ((old[1] == 'item' && old2[1] == 'item') || (old[1] == 'currency' && old2[1] == 'currency'))) {
                // Stack like items
                old[2] = old[2] + old2[2];
            } else {
                // Swap different items
                createItem(old2[0], old2[1], old2[2], row, column, true, old2[3]);
            }
        }
        createItem(old[0], old[1], old[2], r, c, true, old[3]);
    });
    inventory[row][column].dragend = inventory[row][column].on('dragend', (pointer, dragX, dragY) => {
        inventory[row][column].depth = 4;
        if (quantity > 1) {
            inventory[row][column].quantityText.depth = 4;
        }
        inventory[row][column].x = inventorySlots[row][column].x;
        inventory[row][column].y = inventorySlots[row][column].y;
        if (inventory[row][column].quantityText != undefined) {
            inventory[row][column].quantityText.x = inventorySlots[row][column].x + offsetX;
            inventory[row][column].quantityText.y = inventorySlots[row][column].y + offsetY;
        }
        setInfoPanelActive(inventory[row][column].infoPanel, false);
    });
}

function destroyItem(row, column) {
    if (row == 5 && column == 2) {
        hudIcons[1].setTexture('inventory_slot');
        hudIcons[1].quantityText.text = '\0';
    }
    updateAttackAndHealth();
    inventory[row][column].hover.destroy();
    inventory[row][column].hoverOut.destroy();
    inventory[row][column].drag.destroy();
    inventory[row][column].drop.destroy();
    inventory[row][column].dragend.destroy();
    destroyInfoPanel(inventory[row][column].infoPanel);
    if (inventory[row][column].quantityText != undefined) {
        inventory[row][column].quantityText.destroy();
    }
    inventory[row][column].destroy();
    inventory[row][column] = undefined;
}

function findRowCol(target) {
    if (inventorySlots[5][0] == target) {
        return [5,0];
    }
    if (inventorySlots[5][1] == target) {
        return [5, 1];
    }
    if (inventorySlots[5][2] == target) {
        return [5, 2];
    }
    for(var r = 0; r < 5; r++) {
        for(var c = 0; c < 11; c++) {
            if(inventorySlots[r][c] == target) {
                return [r,c];
            }
        }
    }
}

function createInventory() {
    inventoryComponents = [];
    inventoryComponents.push(activeScene.add.sprite(600, 360, 'inventory').setOrigin(0.5).setScrollFactor(0));
    inventoryComponents.push(activeScene.add.text(270, 590, 'Weapon', { font: 30 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0));
    inventoryComponents.push(activeScene.add.text(505, 590, 'Armor', { font: 30 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0));
    inventoryComponents.push(activeScene.add.text(740, 590, 'Item', { font: 30 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0));
    inventoryComponents.push(activeScene.add.text(975, 560, 'Level', { font: 40 + "px Gothic", fill: "#9e8035", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0));
    inventoryComponents.push(activeScene.add.text(975, 610, playerLevel, { font: 50 + "px Gothic", fill: "#9e8035", stroke: '#000000', strokeThickness: 5 }).setOrigin(0.5).setScrollFactor(0));

    inventorySlots = [[]];
    inventory = [[]];
    
    var x = 600 - inventoryComponents[0].width / 2 + 51;
    var y = 360 - inventoryComponents[0].height / 2 + 51;
    for(var r = 0; r < 5; r++) {
        inventorySlots.push([]);
        inventory.push([]);
        for(var c = 0; c < 11; c++) {
            inventorySlots[r].push(activeScene.add.sprite(x + c * 90, y + r * 90, 'inventory_slot').setScrollFactor(0).setInteractive({
                dropZone: true
            }));
            inventory[r].push(undefined);
        }
    }
    for (var r = 0; r < 5; r++) {
        for (var c = 0; c < 11; c++) {
            inventoryComponents.push(inventorySlots[r][c]);
        }
    }
    inventorySlots.push([]);
    inventory.push([]);
    inventorySlots[5].push(activeScene.add.sprite(x + 3 * 90 - 45, y + 4 * 90 + 120, 'inventory_slot').setScrollFactor(0).setInteractive({
        dropZone: true
    }));
    inventory[5].push(undefined);
    inventorySlots[5].push(activeScene.add.sprite(x + 5 * 90, y + 4 * 90 + 120, 'inventory_slot').setScrollFactor(0).setInteractive({
        dropZone: true
    }));
    inventory[5].push(undefined);
    inventorySlots[5].push(activeScene.add.sprite(x + 7 * 90 + 45, y + 4 * 90 + 120, 'inventory_slot').setScrollFactor(0).setInteractive({
        dropZone: true
    }));
    inventory[5].push(undefined);
    inventoryComponents.push(inventorySlots[5][0]);
    inventoryComponents.push(inventorySlots[5][1]);
    inventoryComponents.push(inventorySlots[5][2]);
    for (var i = 0; i < inventoryComponents.length; i++) {
        inventoryComponents[i].depth = 4;
    }
    setInventoryActive(false);
}

function createMenu() {
    menuComponents = [];
    menuComponents.push(activeScene.add.sprite(600, 360, 'menu').setOrigin(0.5).setScrollFactor(0));
    var startY = 270;
    var gap = 80;
    menuComponents.push(activeScene.add.sprite(600, startY + gap * 0, 'menu_button').setOrigin(0.5).setInteractive().setScrollFactor(0));
    menuComponents[1].on('pointerup', function (pointer) {
        setMenuActive(false); // Resume
    });
    menuComponents.push(activeScene.add.sprite(600, startY + gap * 1, 'menu_button').setOrigin(0.5).setInteractive().setScrollFactor(0));
    menuComponents[2].on('pointerup', function (pointer) {
        setSettingsActive(true); // Settings 
        hideMenu(true);
    });
    menuComponents.push(activeScene.add.sprite(600, startY + gap * 2, 'menu_button').setOrigin(0.5).setInteractive().setScrollFactor(0));
    menuComponents[3].on('pointerup', function (pointer) {
        saveGame(); // Save Game
        var text = activeScene.add.text(1050, 680, 'Saving...', { font: "40px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4, stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0);
        text.depth = 5;
        activeScene.time.delayedCall(1000, () => {
            text.destroy();
        }, null, activeScene);
    });
    menuComponents.push(activeScene.add.sprite(600, startY + gap * 3, 'menu_button').setOrigin(0.5).setInteractive().setScrollFactor(0));
    menuComponents[4].on('pointerup', function (pointer) {
        game.sound.stopAll();
        saveGame();
        activeScene.scene.start('menuScene'); // Quit
    });

    menuComponents.push(activeScene.add.text(600, 270 + 80 * -1, 'MENU', { font: 60 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0));
    menuComponents.push(activeScene.add.text(600, 270 + 80 * 0, 'Resume', { font: 40 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0));
    menuComponents.push(activeScene.add.text(600, 270 + 80 * 1, 'Settings', { font: 40 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0));
    menuComponents.push(activeScene.add.text(600, 270 + 80 * 2, 'Save', { font: 40 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0));
    menuComponents.push(activeScene.add.text(600, 270 + 80 * 3, 'Quit', { font: 40 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0));

    for (var i = 0; i < menuComponents.length; i++) {
        menuComponents[i].depth = 4;
    }
    setMenuActive(false);
}

function setTint(start, value) {
    for(var i = start; i < 20 + start; i+=2){
        settingsComponents[i].clearTint();
    }
    settingsComponents[value].setTintFill(0xffff00);
}

function createSettings() {
    settingsComponents = [];
    settingsComponents.push(activeScene.add.sprite(600, 360, 'menu').setOrigin(0.5).setScrollFactor(0));

    // Master Volume
    var masterHeight = 290;
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 0, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 0, masterHeight, '0', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[1].on('pointerup', function (pointer) {
        setTint(1, 1);
        masterVolume = 0 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 1, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 1, masterHeight, '1', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[3].on('pointerup', function (pointer) {
        setTint(1, 3);
        masterVolume = 1 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 2, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 2, masterHeight, '2', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[5].on('pointerup', function (pointer) {
        setTint(1, 5);
        masterVolume = 2 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 3, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 3, masterHeight, '3', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[7].on('pointerup', function (pointer) {
        setTint(1, 7);
        masterVolume = 3 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 4, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 4, masterHeight, '4', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[9].on('pointerup', function (pointer) {
        setTint(1, 9);
        masterVolume = 4 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 5, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 5, masterHeight, '5', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[11].on('pointerup', function (pointer) {
        setTint(1, 11);
        masterVolume = 5 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 6, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 6, masterHeight, '6', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[13].on('pointerup', function (pointer) {
        setTint(1, 13);
        masterVolume = 6 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 7, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 7, masterHeight, '7', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[15].on('pointerup', function (pointer) {
        setTint(1, 15);
        masterVolume = 7 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 8, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 8, masterHeight, '8', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[17].on('pointerup', function (pointer) {
        setTint(1, 17);
        masterVolume = 8 * .2;
        updateMasterVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 9, masterHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 9, masterHeight, '9', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[19].on('pointerup', function (pointer) {
        setTint(1, 19);
        masterVolume = 9 * .2;
        updateMasterVolume();
    });

    // Music Volume
    var musicHeight = 410;
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 0, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 0, musicHeight, '0', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[21].on('pointerup', function (pointer) {
        setTint(21, 21);
        musicVolume = 0 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 1, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 1, musicHeight, '1', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[23].on('pointerup', function (pointer) {
        setTint(21, 23);
        musicVolume = 1 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 2, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 2, musicHeight, '2', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[25].on('pointerup', function (pointer) {
        setTint(21, 25);
        musicVolume = 2 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 3, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 3, musicHeight, '3', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[27].on('pointerup', function (pointer) {
        setTint(21, 27);
        musicVolume = 3 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 4, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 4, musicHeight, '4', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[29].on('pointerup', function (pointer) {
        setTint(21, 29);
        musicVolume = 4 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 5, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 5, musicHeight, '5', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[31].on('pointerup', function (pointer) {
        setTint(21, 31);
        musicVolume = 5 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 6, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 6, musicHeight, '6', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[33].on('pointerup', function (pointer) {
        setTint(21, 33);
        musicVolume = 6 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 7, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 7, musicHeight, '7', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[35].on('pointerup', function (pointer) {
        setTint(21, 35);
        musicVolume = 7 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 8, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 8, musicHeight, '8', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[37].on('pointerup', function (pointer) {
        setTint(21, 37);
        musicVolume = 8 * .2;
        updateMusicVolume();
    });
    settingsComponents.push(activeScene.add.sprite(465 + 30 * 9, musicHeight, 'volume_tab').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(465 + 30 * 9, musicHeight, '9', { font: 30 + "px Gothic", fill: "#000000" }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents[39].on('pointerup', function (pointer) {
        setTint(21, 39);
        musicVolume = 9 * .2;
        updateMusicVolume();
    });

    // Back
    settingsComponents.push(activeScene.add.sprite(600, 510, 'menu_button').setOrigin(0.5).setInteractive().setScrollFactor(0));
    settingsComponents[41].on('pointerup', function (pointer) {
        hideMenu(false);
        setSettingsActive(false);
    });

    settingsComponents.push(activeScene.add.text(600, 180, 'Settings', { font: 60 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(600, 240, 'Master Volume', { font: 40 + "px Gothic", fill: "#000000"}).setOrigin(0.5).setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(600, 360, 'Music Volume', { font: 40 + "px Gothic", fill: "#000000"}).setOrigin(0.5).setScrollFactor(0));
    settingsComponents.push(activeScene.add.text(600, 510, 'Back', { font: 40 + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0));

    for (var i = 0; i < settingsComponents.length; i++) {
        settingsComponents[i].depth = 4;
    }
    setTint(1, 2 * Math.trunc(masterVolume / .2) + 1);
    setTint(21, 2 * Math.trunc(musicVolume / .2) + 21);
    setSettingsActive(false);
}

function setMenuActive(active) {
    for (var i = 0; i < menuComponents.length; i++) {
        menuComponents[i].visible = active;
    }
    player.blockInput = active;
    player.menuOpen = active;
    setSettingsActive(false);
}

function hideMenu(active){
    for (var i = 0; i < menuComponents.length; i++) {
        menuComponents[i].visible = !active;
    }
}

function setSettingsActive(active) {
    for (var i = 0; i < settingsComponents.length; i++) {
        settingsComponents[i].visible = active;
    }
}

function setInventoryActive(active) {
    for (var i = 0; i < inventoryComponents.length; i++) {
        inventoryComponents[i].visible = active;
    }
    for (var i = 0; i < hudComponents.length; i++) {
        hudComponents[i].visible = !active;
    }
    for(var r = 0; r < 5; r++) {
        for(var c = 0; c < 11; c++) {
            if(inventory[r][c] != undefined) {
                inventory[r][c].visible = active;
                setInfoPanelActive(inventory[r][c].infoPanel, false);
                if (inventory[r][c].quantityText != undefined) {
                    inventory[r][c].quantityText.visible = active;
                }
            }
        }
    }
    if (inventory[5][0] != undefined) {
        inventory[5][0].visible = active;
        setInfoPanelActive(inventory[5][0].infoPanel, false);
        if (inventory[5][0].quantityText != undefined) {
            inventory[5][0].quantityText.visible = active;
        }
    }
    if (inventory[5][1] != undefined) {
        inventory[5][1].visible = active;
        setInfoPanelActive(inventory[5][1].infoPanel, false);
        if (inventory[5][1].quantityText != undefined) {
            inventory[5][1].quantityText.visible = active;
        }
    }
    if (inventory[5][2] != undefined) {
        inventory[5][2].visible = active;
        setInfoPanelActive(inventory[5][2].infoPanel, false);
        if (inventory[5][2].quantityText != undefined) {
            inventory[5][2].quantityText.visible = active;
            hudIcons[1].quantityText.text = inventory[5][2].quantityText.text;
        } else {
            hudIcons[1].quantityText.text = '\0';
        }
    } else {
        if(hudIcons[1] != undefined) {
            hudIcons[1].quantityText.text = '\0';
        }
    }
    if(player != undefined) {
        player.blockInput = active;
        player.inventoryOpen = active;
    }
}

function createHUD() {
    hudComponents = [];
    hud = activeScene.add.sprite(600, 0, 'hud').setOrigin(0.5).setScrollFactor(0);
    hud.y = 630 + (hud.height - hud.height * hudScale) / 2;
    hud.setScale(hudScale);
    hudComponents.push(hud);
    var fontSize = 40;
    var cellY = hud.y + (hud.height * hudScale) * .145;
    var cellX = [];
    for(var i = 0; i < 6; i++) {
        cellX.push(hud.x + (-2 + 0.8 * i) * (hud.width * hudScale) / 6);
    }
    hudIcons = [];
    hudIcons.push(activeScene.add.sprite(cellX[0], cellY, 'bag_icon').setOrigin(0.5).setScrollFactor(0).setScale(hudScale));
    hudIcons.push(activeScene.add.sprite(cellX[1], cellY, 'inventory_slot').setOrigin(0.5).setScrollFactor(0).setScale(hudScale));
    hudIcons[1].quantityText = activeScene.add.text(cellX[1] + 25 * hudScale, cellY + 25 * hudScale, '\0', { font: 25 * hudScale + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: 3 * hudScale }).setOrigin(0.5).setScrollFactor(0);
    for(var i = 0; i < 4; i++) {
        hudIcons.push(activeScene.add.sprite(cellX[i+2], cellY, playerClass + '_icon_' + i).setOrigin(0.5).setScrollFactor(0).setScale(hudScale));
    }
    for(var i = 0; i < hudIcons.length; i++) {
        hudComponents.push(hudIcons[i]);
    }
    hudComponents.push(hudIcons[1].quantityText);
    hudComponents.push(activeScene.add.text(cellX[0], cellY, 'E', { font: fontSize * hudScale + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: fontSize * hudScale * .1 }).setOrigin(0.5).setScrollFactor(0));
    hudComponents.push(activeScene.add.text(cellX[1], cellY, 'C', { font: fontSize * hudScale + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: fontSize * hudScale * .1 }).setOrigin(0.5).setScrollFactor(0));
    hudComponents.push(activeScene.add.text(cellX[2], cellY, '1', { font: fontSize * hudScale + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: fontSize * hudScale * .1 }).setOrigin(0.5).setScrollFactor(0));
    hudComponents.push(activeScene.add.text(cellX[3], cellY, '2', { font: fontSize * hudScale + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: fontSize * hudScale * .1 }).setOrigin(0.5).setScrollFactor(0));
    hudComponents.push(activeScene.add.text(cellX[4], cellY, '3', { font: fontSize * hudScale + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: fontSize * hudScale * .1 }).setOrigin(0.5).setScrollFactor(0));
    hudComponents.push(activeScene.add.text(cellX[5], cellY, '4', { font: fontSize * hudScale + "px Gothic", fill: "#ffffff", stroke: '#000000', strokeThickness: fontSize * hudScale * .1 }).setOrigin(0.5).setScrollFactor(0));
    healthBar = activeScene.add.rectangle(hud.x, hud.y - (hud.height * hudScale) * 0.37, 548 * hudScale, 30 * hudScale, 0xff0000, 1).setOrigin(0.5).setScrollFactor(0);
    xpBar = activeScene.add.rectangle(hud.x, hud.y - (hud.height * hudScale) * 0.245, 0, 5 * hudScale, 0xff00ff, 1).setOrigin(0.5).setScrollFactor(0);
    hudComponents.push(healthBar);
    hudComponents.push(xpBar);
    for(var i = 0; i < hudComponents.length; i++) {
        hudComponents[i].depth = 1;
    }
    cutsceneBars = [];
    cutsceneBars.push(activeScene.add.sprite(600, -70, 'cutscene_bar').setOrigin(0.5).setScrollFactor(0));
    cutsceneBars.push(activeScene.add.sprite(600, game.config.height + 70, 'cutscene_bar').setOrigin(0.5).setScrollFactor(0));
    cutsceneBars[0].depth = 5;
    cutsceneBars[1].depth = 5;
    updateXPBar();
}

function updateHealthBar() {
    var percent = (player.health + player.bufferHealth) / (player.maxHealth + player.bufferHealth);
    healthBar.setSize(548 * hudScale * percent,30 * hudScale);
    healthBar.x = hud.x + ((548 * hudScale) - (548 * hudScale * percent));
}

function updateXPBar() {
    var percent = playerXP / (playerLevel * 500);
    xpBar.setSize(548 * hudScale * percent, 5 * hudScale);
    xpBar.x = hud.x - (548 * hudScale) / 2;
}

function explosion(old_attack, container, duration) {
    var size;
    if(old_attack.width > old_attack.height) {
        size = old_attack.width;
    } else {
        size = old_attack.height;
    }
    var attack = new Attack(activeScene, old_attack.caster, old_attack.direction, size, size, 0, old_attack.damage);
    attack.x = old_attack.x;
    attack.y = old_attack.y;
    container.push(attack);

    var sprite = new Phaser.GameObjects.Sprite(activeScene, old_attack.x, old_attack.y, 'fireball_explosion');
    activeScene.add.existing(sprite);

    activeScene.fireballExplosion.play();

    activeScene.time.delayedCall(duration, () => {
        for (var i = 0; i < container.length; i++) {
            if (container[i] == attack) {
                container.splice(i, 1);
                attack.destroy();
            }
        }
        sprite.destroy();
    }, null, activeScene);
}

function cutscene(type, duration, wait, text, music, image) {
    var fontSize = 40;
    var startEndTime = 1000;
    activeScene.time.delayedCall(wait, () => {
        switch(type) {
            case 'start': 
                displayTexts = [];
    
                toggleUI(false);
                if(music != undefined) {
                    music.play();
                }
                activeScene.tweens.add({
                    targets: cutsceneBars[0],
                    y: 70,
                    duration: startEndTime
                });
                activeScene.tweens.add({
                    targets: cutsceneBars[1],
                    y: game.config.height - 70,
                    duration: startEndTime,
                });
                activeScene.time.delayedCall(startEndTime, () => {
                    if (inCutscene && !inCutsceneTween) {
                        var displayText = activeScene.add.text(600, cutsceneBars[1].y, text, { font: fontSize + "px Gothic", fill: "#ffffff", stroke: '#000000', align: 'center' }).setOrigin(0.5).setScrollFactor(0);
                        displayText.depth = 5;
                        displayTexts.push(displayText);
                        var displayImage;
                        if(image != undefined) {
                            displayImage = activeScene.add.sprite(600 - displayText.width / 2 - 50, cutsceneBars[1].y, image).setOrigin(0.5).setScrollFactor(0);
                            displayImage.depth = 5;
                            displayTexts.push(displayImage);
                        }
                        activeScene.time.delayedCall(duration, () => {
                            if (displayText != undefined) {
                                displayText.destroy();
                            }
                            if (displayImage != undefined) {
                                displayImage.destroy();
                            }
                        }, null, activeScene);
                    }
                }, null, activeScene);
                break;
            case 'continue': 
                if (inCutscene && !inCutsceneTween) {
                    var displayText = activeScene.add.text(600, cutsceneBars[1].y, text, { font: fontSize + "px Gothic", fill: "#ffffff", stroke: '#000000', align: 'center' }).setOrigin(0.5).setScrollFactor(0);
                    displayText.depth = 5;
                    displayTexts.push(displayText);
                    var displayImage;
                    if (image != undefined) {
                        displayImage = activeScene.add.sprite(600 - displayText.width / 2 - 50, cutsceneBars[1].y, image).setOrigin(0.5).setScrollFactor(0);
                        displayImage.depth = 5;
                        displayTexts.push(displayImage);
                    }
                    activeScene.time.delayedCall(duration, () => {
                        if (displayText != undefined) {
                            displayText.destroy();
                        }
                        if (displayImage != undefined) {
                            displayImage.destroy();
                        }
                    }, null, activeScene);
                }
                break;
            case 'end': 
                if(inCutscene) {
                    var displayText = activeScene.add.text(600, cutsceneBars[1].y, text, { font: fontSize + "px Gothic", fill: "#ffffff", stroke: '#000000', align: 'center' }).setOrigin(0.5).setScrollFactor(0);
                    displayText.depth = 5;
                    displayTexts.push(displayText);
                    var displayImage;
                    if (image != undefined) {
                        displayImage = activeScene.add.sprite(600 - displayText.width/2 - 50, cutsceneBars[1].y, image).setOrigin(0.5).setScrollFactor(0);
                        displayImage.depth = 5;
                        displayTexts.push(displayImage);
                    }
                    if(duration > 0) {
                        activeScene.cameras.main.fadeOut(duration);
                    }
                    activeScene.time.delayedCall(duration, () => {
                        if (displayText != undefined)
                        {
                            for (var i = 0; i < displayTexts.length; i++) {
                                if (displayTexts[i] != undefined) {
                                    displayTexts[i].destroy();
                                }
                            }
                            displayTexts = [];
                            inCutsceneTween = true;
                            activeScene.cameras.main.fadeIn(1000);
                            activeScene.tweens.add({
                                targets: cutsceneBars[0],
                                y: -70,
                                duration: startEndTime
                            });
                            activeScene.tweens.add({
                                targets: cutsceneBars[1],
                                y: game.config.height + 70,
                                duration: startEndTime,
                                onComplete: function () {
                                    inCutscene = false;
                                    inCutsceneTween = false;
                                    toggleUI(true);
                                    for (var i = 0; i < displayTexts.length; i++) {
                                        if (displayTexts[i] != undefined) {
                                            displayTexts[i].destroy();
                                        }
                                    }
                                    displayTexts = [];
                                    if (music != undefined) {
                                        music.stop();
                                    }
                                },
                            });
                        }
                        if (displayImage != undefined) {
                            displayImage.destroy();
                        }
                    }, null, activeScene);
                }
                break;
        }
    }, null, activeScene);
    if(type == 'continue') {
        return duration;
    }
    return duration + startEndTime;
}

function toggleUI(active) {
    setMenuActive(false);
    setInventoryActive(false);
    for(var i = 0; i < hudComponents.length; i++) {
        hudComponents[i].visible = active
    }
}

function checkCollisions() {
    for (var i = 0; i < playerAttacks.length; i++) {
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
                playerAttacks[i].targets.splice(j, 1);
                for (var k = 0; k < projectiles.length; k++) {
                    var _projectile = projectiles[k];
                    if (playerAttacks[i] == _projectile) {
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
    for (var i = 0; i < projectiles.length; i++) {
        if (projectileTerrainCollision(projectiles[i])) {
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
    var rect = new Phaser.Geom.Rectangle(hud.x + activeScene.cameras.main.worldView.x - hud.width * hudScale / 2, hud.y + activeScene.cameras.main.worldView.y - hud.height * hudScale / 2, hud.width * hudScale, hud.height * hudScale);
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

function collectItem(item) {
    // Try to stack item
    var canStack = false;
    var openSlot = [-1, -1];
    outer:
    for (var r = 0; r < 5; r++) {
        for (var c = 0; c < 11; c++) {
            if (inventory[r][c] != undefined && inventory[r][c].item == item.itemName && inventory[r][c].type == item.type) {
                openSlot[0] = r;
                openSlot[1] = c;
                canStack = true;
                break outer;
            }
        }
        if (inventory[5][1] != undefined && inventory[5][1].item == item.itemName && inventory[5][1].type == item.type) {
            openSlot[0] = 5;
            openSlot[1] = 1;
            canStack = true;
        }
        if (inventory[5][2] != undefined && inventory[5][2].item == item.itemName && inventory[5][2].type == item.type) {
            openSlot[0] = 5;
            openSlot[1] = 2;
            canStack = true;
        }
        if (inventory[5][3] != undefined && inventory[5][3].item == item.itemName && inventory[5][3].type == item.type) {
            openSlot[0] = 5;
            openSlot[1] = 3;
            canStack = true;
        }
    }
    if (canStack && (item.type == 'item' || item.type == 'currency')) {
        var quantity = inventory[openSlot[0]][openSlot[1]].quantity + 1;
        destroyItem(openSlot[0], openSlot[1]);
        createItem(item.itemName, item.type, quantity, openSlot[0], openSlot[1], false, item.level);
        setInventoryActive(false);
    } else {
        // Add to open slot in inventory
        outer:
        for(var r = 0; r < 5; r++) {
            for(var c = 0; c < 11; c++) {
                if(inventory[r][c] == undefined) {
                    openSlot[0] = r;
                    openSlot[1] = c;
                    break outer;
                }
            }
        }
        // Return if no open slots
        if(openSlot[0] == -1 && openSlot[1] == -1) {
            return;
        }
        // Otherwise add to inventory
        createItem(item.itemName, item.type, 1, openSlot[0], openSlot[1], false, item.level);
    }
    // Remove from groundItems
    for(var i = 0; i < groundItems.length; i++) {
        if(groundItems[i] == item) {
            groundItems.splice(i,1);
            break;
        }
    }
    // Destroy
    item.destroy();
}

function sumTo(value) {
    return value * (value + 1) / 2;
}

function getTypeName(type) {
    switch (type) {
        case 'item': return 'Item';
        case 'weapon': return 'Weapon';
        case 'armor': return 'Armor';
        case 'currency': return 'Currency';
    }
}

function getName(item, level) {
    switch (item) {
        case 'health_potion': return 'Health Potion';
        case 'key': return 'Key';
        case 'rogue_weapon': return 'Crossbow + ' + level;
        case 'warrior_weapon': return 'Sword + ' + level;
        case 'mage_weapon': return 'Staff + ' + level;
        case 'warrior_armor': return 'Chainmail + ' + level;
        case 'rogue_armor': return 'Jacket + ' + level;
        case 'mage_armor': return 'Cloak + ' + level;
        case 'coin': return 'Coin';
    }
}

function getType(item) { 
    switch(item) {
        case 'health_potion': return 'item';
        case 'key': return 'item';
        case 'rogue_weapon': return 'weapon';
        case 'warrior_weapon': return 'weapon';
        case 'mage_weapon': return 'weapon';
        case 'warrior_armor': return 'armor';
        case 'rogue_armor': return 'armor';
        case 'mage_armor': return 'armor';
        case 'coin': return 'currency';
    }
}

function getDescription(item, level) {
    switch (item) {
        case 'health_potion': return 'Effect: Restores\n25 health';
        case 'key': return 'Effect: Opens a\nlocked chest';
        case 'rogue_weapon': return 'Weapon that deals\n' + weaponValue(level) + ' damage';
        case 'warrior_weapon': return 'Weapon that deals\n' + weaponValue(level) + ' damage';
        case 'mage_weapon': return 'Weapon that deals\n' + weaponValue(level) + ' damage';
        case 'warrior_armor': return 'Armor that provides\n' + armorValue(level) + ' health';
        case 'rogue_armor': return 'Armor that provides\n' + armorValue(level) + ' health';
        case 'mage_armor': return 'Armor that provides\n' + armorValue(level) + ' health';
        case 'coin': return 'Can be exchanged\nfor items';
    }
}

function armorValue(level) {
    return (sumTo(level) * 2 + 4);
}

function weaponValue(level) {
    return (sumTo(level) + 4);
}