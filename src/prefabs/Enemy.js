class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture, colliderRadius, movementSpeed, target) {
        super(activeScene, x, y, texture);
        // Enemy Configuration
        activeScene.add.existing(this);
        activeScene.physics.add.existing(this);
        this.setCircle(colliderRadius);
        this.movementSpeed = movementSpeed;
        this.target = target;
        this.targetNode = null;
        this.adjacent = false;
        this.movingToNode = false;
    }

    lookAt(target) {
        var forgiveness = 20;
        if (Math.abs(this.x - target.x) < forgiveness && this.y < target.y) {
            this.angle = 180; // look up
        } else if (Math.abs(this.x - target.x) < forgiveness && this.y > target.y) {
            this.angle = 0; // look down
        } else if (this.x > target.x && Math.abs(this.y - target.y) < forgiveness) {
            this.angle = 270; // look right
        } else if (this.x < target.x && Math.abs(this.y - target.y) < forgiveness) {
            this.angle = 90; // look left
        } else if (this.x > target.x && this.y < target.y) {
            this.angle = 225; // look up, right
        } else if (this.x > target.x && this.y > target.y) {
            this.angle = 315; // look down, right
        } else if (this.x < target.x && this.y > target.y) {
            this.angle = 45; // look down, left
        } else if (this.x < target.x && this.y < target.y) {
            this.angle = 135; // look up, left
        }
    }

    pathfind(target) {
        // step 1: return if any of the following are met:
        if (this.movingToNode == true) {  // enemy is moving to align itself in a node
            this.setVelocity(0, 0);
            this.targetNode = null;
            return;
        }
        if (this.targetNode != null) { // enemy no longer has a target node
            if (Math.abs(this.x - target.x) <= 90 && Math.abs(this.y - target.y) <= 90) { // enemy is within range of it's target
                if(!this.adjacent) { // enemy has not been flagged as adjacent yet
                    this.setVelocity(0, 0);
                    this.adjacent = true;
                }
                this.lookAt(target);
                return;
            } else if(this.adjacent){ // enemy is not in range of the target, but is still flagged as adjacent
                this.adjacent = false;
                moveToNode(this);
                this.setVelocity(0, 0);
                this.targetNode = null;
            } else if (Math.abs(this.x - this.targetNode.x) < 5 && Math.abs(this.y - this.targetNode.y) < 5) { // enemy reached target node
                snapToNode(this);
                this.setVelocity(0,0);
                this.targetNode = null;
            } else { // enemy is still en route to target node
                return;
            }
        }
        // step 2: instantiate variables
        var startNode = getNodeIn(this);
        startNode.parent = null;
        var endNode = getClosestNode(target);
        var currentNode = startNode;
        var open = [];
        var closed = [];
        // step 3: loop
        var counter = 0;
        do {
            // step 4: open all adjacent nodes (that aren't duplicates unless their cost is less and haven't been checked already)
            for(var i = 0; i < currentNode.neighbors.length; i++) {
                var addCost;
                if (currentNode.neighbors[i].x == currentNode.x || currentNode.neighbors[i].y == currentNode.y) {
                    addCost = 80;
                } else {
                    addCost = 80 * 1.4;
                }
                currentNode.neighbors[i].cost = addCost + Math.abs(endNode.x - currentNode.neighbors[i].x) + Math.abs(endNode.y - currentNode.neighbors[i].y);
                var alreadyChecked = false;
                for (var j = 0; j < closed.length; j++) {
                    if (currentNode.neighbors[i].x == closed[j].x && currentNode.neighbors[i].y == closed[j].y) {
                        alreadyChecked = true;
                        break;
                    }
                }
                var duplicate = false;
                for(var j = 0; j < open.length; j ++) {
                    if (currentNode.neighbors[i].x == open[j].x && currentNode.neighbors[i].y == open[j].y){
                        if (currentNode.neighbors[i].cost < open[j].cost) {
                            currentNode.neighbors[i].parent = currentNode;
                            open[j] = currentNode.neighbors[i];
                        }
                        duplicate = true;
                        break;
                    }
                }
                if(!duplicate && !alreadyChecked) {
                    currentNode.neighbors[i].parent = currentNode;
                    open.push(currentNode.neighbors[i]); 
                }
            }
            // step 5: set current node to the open node with the lowest cost, close it, and remove it from open
            var cheapest = 0;
            for (var i = 1; i < open.length; i++) {
                if(open[i].cost < open[cheapest].cost) {
                    cheapest = i;
                }
            }
            currentNode = open[cheapest];
            closed.push(currentNode);
            open.splice(cheapest, 1);
            counter++;
        } while (!(currentNode.x == endNode.x && currentNode.y == endNode.y) && counter < 500);
        // step 6: create path to target
        var path = [currentNode];
        var c = 0;
        do{
            c++;
            path.push(path[path.length-1].parent);
        } while (!(path[path.length - 1].x == startNode.x && path[path.length - 1].y == startNode.y) && c < 100);
        // step 7: move along path
        this.targetNode = path[path.length - 2];
        if(this.targetNode.x == startNode.x && this.targetNode.y < startNode.y ) {
            // move up
            this.angle = 0;
            this.setVelocity(0, this.movementSpeed * -1);
        } else if (this.targetNode.x == startNode.x && this.targetNode.y > startNode.y) {
            // move down
            this.angle = 180;
            this.setVelocity(0, this.movementSpeed * 1);
        } else if (this.targetNode.x > startNode.x && this.targetNode.y == startNode.y) {
            // move right
            this.angle = 90;
            this.setVelocity(this.movementSpeed * 1,0);
        } else if (this.targetNode.x < startNode.x && this.targetNode.y == startNode.y) {
            // move left
            this.angle = 270;
            this.setVelocity(this.movementSpeed * -1, 0);
        } else if (this.targetNode.x > startNode.x && this.targetNode.y < startNode.y) {
            // move up, right
            this.angle = 45;
            this.setVelocity(this.movementSpeed * 0.6, this.movementSpeed * -0.6);
        } else if (this.targetNode.x > startNode.x && this.targetNode.y > startNode.y) {
            // move down, right
            this.angle = 135;
            this.setVelocity(this.movementSpeed * 0.6, this.movementSpeed * 0.6);
        } else if (this.targetNode.x < startNode.x && this.targetNode.y > startNode.y) {
            // move down, left
            this.angle = 225;
            this.setVelocity(this.movementSpeed * -0.6, this.movementSpeed * 0.6);
        } else if (this.targetNode.x < startNode.x && this.targetNode.y < startNode.y) {
            // move up, left
            this.angle = 315;
            this.setVelocity(this.movementSpeed * -0.6, this.movementSpeed * -0.6);
        }
    }
}