class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, colliderRadius, movementSpeed) {
        super(scene, x, y, texture);
        // Enemy Configuration
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCircle(colliderRadius);
        this.movementSpeed = movementSpeed;
        this.body.immovable = true;
        this.enRoute = false;
    }

    pathfind(target) {
        var counter = 0;
        // step 1: return if already en route
        if(this.enRoute) {return;}
        // step 2: instantiate variables
        var startNode = getNodeIn(this);
        var endNode = getClosestNode(target);
        var currentNode = startNode;
        var open = [];
        var closed = [];
        // step 3: loop
        do {
            // step 4: open all adjacent nodes (that aren't duplicates unless their cost is less and haven't been checked already)
            for(var i = 0; i < currentNode.neighbors.length; i++) {
                currentNode.neighbors[i].parent = currentNode;
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
                            open[j] = currentNode.neighbors[i];
                        }
                        duplicate = true;
                        break;
                    }
                }
                if(!duplicate && !alreadyChecked) {
                    open.push(currentNode.neighbors[i]); 
                }
            }
            // step 5: set current node to the open node with the lowest cost, close it, and remove it from open
            closed.push(currentNode);
            open.splice(cheapest, 1);
            var cheapest = 0;
            for (var i = 1; i < open.length; i++) {
                if(open[i].cost < open[cheapest].cost) {
                    cheapest = i;
                }
            }
            currentNode = open[cheapest];
            currentNode.alpha = 1;
            counter++;
        } while (!(currentNode.x == endNode.x && currentNode.y == endNode.y) && counter < 500);

    }
}