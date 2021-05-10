let config = {
    type: Phaser.WEBGL,
    width: 1200,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [ Level01 ]
}
let game = new Phaser.Game(config);

//global variables

// reserve keyboard vars
let keyW, keyA, keyS, keyD;