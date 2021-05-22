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
    scene: [Menu, NewGame, Settings, Credits, Level01 ]
}
let game = new Phaser.Game(config);

// global variables
let playerSpeed = 300;              // how fast the player will move
let diagonalSpeed = .71;            // multiplier for how fast entities move diagonally
let pathNodes = [[]];               // holds path nodes for enemy pathfinding
let triangles = [[]];               // holds triangles for diagonal collision
let player;                         // holds player
let lastPlayerX;                    // holds player's last x position
let lastPlayerY;                    // holds player's last y position
let enemies = [];                   // holds enemies
let activeScene = null;             // holds the current scene
let activeSceneKey = null;          // holds the current scene's key
let map = null;                     // holds current tilemap

// data for save file
let saveName = 'saveData';          // holds name of saved data
let playerClass = 'warrior';        // holds player's class
let secretUnlocked = true;         // hold if secret character has been unlocked

// reserve keyboard vars
let keyW, keyA, keyS, keyD, keyUP, keyLEFT, keyDOWN, keyRIGHT, keyENTER, keyESCAPE;

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
    if (object.body.velocity.x != 0 && object.body.velocity.y != 0) {
        if(diagonal) {
            scale = .145;
        } else {
            scale = .101;
        }
    } else {
        if (diagonal) {
            scale = .101;
        } else {
            scale = .145;
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

function spawnZombie(x, y, target) {
    var e = new Zombie(x, y, 'zombie', 40, 200, target);
    snapToNode(e);
    enemies.push(e);
}

function spawnSlime(x, y, target) {
    var e = new Slime(x, y, 'slime_idle', 40, 200, target);
    snapToNode(e);
    enemies.push(e);
}

function saveGame() {
    var file = {
        class: playerClass,
        level: activeSceneKey,
        secret: secretUnlocked,
    };
    localStorage.setItem(saveName, JSON.stringify(file));
}

function loadGame() {
    var file = JSON.parse(localStorage.getItem(saveName));
    console.log(file.class);
    console.log(file.level);
    console.log(file.secret);
    playerClass = file.class;
    activeScene.scene.start(file.level);
}

function removeGame() {
    localStorage.removeItem(saveName);
}

function fileExists() {
    var file = JSON.parse(localStorage.getItem(saveName));
    return file != null;
}

function loadPlayerSpritesheets(scene) {
    scene.load.spritesheet('warrior_walking', './assets/warrior/warrior_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('warrior_idle', './assets/warrior/warrior_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('rogue_walking', './assets/rogue/rogue_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('rogue_idle', './assets/rogue/rogue_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('mage_walking', './assets/mage/mage_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('mage_idle', './assets/mage/mage_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
    scene.load.spritesheet('necromancer_walking', './assets/necromancer/necromancer_walking.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 1 });
    scene.load.spritesheet('necromancer_idle', './assets/necromancer/necromancer_idle.png', { frameWidth: 80, frameHeight: 80, startFrame: 0, endFrame: 0 });
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
}

function createSounds() {
    activeScene.walkSound = activeScene.sound.add('walk', {
        rate: 1,
        volume: 4,
        loop: true
    });
}