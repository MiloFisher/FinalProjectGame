let config = {
    type: Phaser.WEBGL,
    width: 1200,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: [ Level01 ]
}
let game = new Phaser.Game(config);

//global variables
let playerSpeed = 300;

// reserve keyboard vars
let keyW, keyA, keyS, keyD;