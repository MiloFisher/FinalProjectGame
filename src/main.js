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
    scene: [ Level01 ]
}
let game = new Phaser.Game(config);

// global variables
let playerSpeed = 300;              // how fast the player will move
let pathNodes = [];                 // holds path nodes for enemy pathfinding
let enemies = [];                   // holds enemies
let obstacles = [];                 // holds obstacles
let activeScene = null;             // holds the current scene
// reserve keyboard vars
let keyW, keyA, keyS, keyD;

// global functions
function getClosestNode(object) {
    var closest = 0;
    for (var i = 0; i < pathNodes.length; i++) {
        if (Math.abs(object.x - pathNodes[i].x) <= Math.abs(object.x - pathNodes[closest].x) && Math.abs(object.y - pathNodes[i].y) <= Math.abs(object.y - pathNodes[closest].y)) {
            closest = i;
        }
    }
    return pathNodes[closest];
}

function getNodeIn(object){
    for(var i = 0; i < pathNodes.length; i++) {
        if (Math.abs(object.x - pathNodes[i].x) <= 40 && Math.abs(object.y - pathNodes[i].y) <= 40) { return pathNodes[i]; }
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

function generatePathNodes(spacingX, spacingY, lowerX, lowerY, upperX, upperY) {
    pathNodes = [];
    var pathArrayLength = 0;
    for(var r = lowerY + spacingY/2; r < upperY; r += spacingY) {
        pathArrayLength = 0;
        for (var c = lowerX + spacingX/2; c < upperX; c += spacingX) {
            spawnPathNode(c,r);
            pathArrayLength++;
        }
    }
    for(var i = 0; i < pathNodes.length; i++) {
        // above 
        if (i - pathArrayLength >= 0) { pathNodes[i].neighbors.push(pathNodes[i - pathArrayLength]); }
        // above, right
        if (i - pathArrayLength >= 0 && (i + 1) % pathArrayLength != 0) { pathNodes[i].neighbors.push(pathNodes[i - pathArrayLength + 1]); }
        // right
        if ((i + 1) % pathArrayLength != 0) { pathNodes[i].neighbors.push(pathNodes[i + 1]); }
        // right, below
        if ((i + 1) % pathArrayLength != 0 && i + pathArrayLength < pathNodes.length) { pathNodes[i].neighbors.push(pathNodes[i + pathArrayLength + 1]); }
        // below
        if (i + pathArrayLength < pathNodes.length) { pathNodes[i].neighbors.push(pathNodes[i + pathArrayLength]); }
        // below, left
        if (i + pathArrayLength < pathNodes.length && (i - 1) % pathArrayLength != pathArrayLength - 1 && (i - 1) % pathArrayLength >= 0) { pathNodes[i].neighbors.push(pathNodes[i + pathArrayLength - 1]); }
        // left
        if ((i - 1) % pathArrayLength != pathArrayLength - 1 && (i - 1) % pathArrayLength >= 0) { pathNodes[i].neighbors.push(pathNodes[i - 1]); }
        // left, above
        if ((i - 1) % pathArrayLength != pathArrayLength - 1 && (i - 1) % pathArrayLength >= 0 && i - pathArrayLength >= 0) { pathNodes[i].neighbors.push(pathNodes[i - pathArrayLength - 1]); }
    }
}

function removeFromNeighbors(node) {
    for(var i = 0; i < pathNodes.length; i++) {
        for(var j = 0; j < pathNodes[i].neighbors.length; j++) {
            if(pathNodes[i].neighbors[j] == node) {
                pathNodes[i].neighbors.splice(j,1);
                break;
            }
        }
    }
}

function spawnPathNode(x,y) {
    pathNodes.push(new PathNode(x,y,'pathNode'));
}

function spawnZombie(x, y, target) {
    var z = new Zombie(x, y, 'zombie', 40, 200, target);
    snapToNode(z);
    enemies.push(z);
}