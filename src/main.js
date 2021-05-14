let config = {
    type: Phaser.WEBGL,
    width: 1200,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: [ Menu, Level01 ]
}
let game = new Phaser.Game(config);

// global variables
let playerSpeed = 300;              // how fast the player will move
let pathNodes = [[]];               // holds path nodes for enemy pathfinding
let enemies = [];                   // holds enemies
let obstacles = [];                 // holds obstacles
let activeScene = null;             // holds the current scene
let map = null;                     // holds current tilemap
// reserve keyboard vars
let keyW, keyA, keyS, keyD;

// global functions
function getClosestNode(object) {
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
    for(var r = 0; r < map.height; r++) {
        for(var c = 0; c < map.width; c++) {
            var tile = map.getTileAt(c, r);
            if (tile.properties.walkable) {
                if (Math.abs(object.x - pathNodes[r][c].x) <= 40 && Math.abs(object.y - pathNodes[r][c].y) <= 40) { return pathNodes[r][c]; }
            }
        }
    }
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
    var z = new Zombie(x, y, 'zombie', 40, 200, target);
    snapToNode(z);
    enemies.push(z);
}