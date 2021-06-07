class Chest extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y) {
        super(activeScene, x, y, 'chest_closed');
        // Chest Configuration
        activeScene.add.existing(this);
        activeScene.physics.add.existing(this);
        this.opened = false;
        this.lootTable = ['health_potion', 'key', 'coin', playerClass + '_weapon', playerClass + '_armor'];
        this.itemDrops = Phaser.Math.Between(1, 4);
    }

    open() {
        if(this.opened) {
            return;
        }
        this.opened = true;
        this.setTexture('chest_opened');
        activeScene.chest.play();
        for(var i = 0; i < this.itemDrops; i++) {
            var tableIndex = Phaser.Math.Between(0, this.lootTable.length - 1);
            var item = new Phaser.Physics.Arcade.Sprite(activeScene, this.x, this.y, this.lootTable[tableIndex] + '_icon');
            item.setScale(.5);
            item.itemName = this.lootTable[tableIndex];
            item.type = getType(this.lootTable[tableIndex]);
            var levelChoices = [playerLevel - 1, playerLevel, playerLevel, playerLevel, playerLevel + 1];
            item.level = levelChoices[Phaser.Math.Between(0, levelChoices.length - 1)];
            activeScene.add.existing(item);
            activeScene.physics.add.existing(item);
            groundItems.push(item);
            //collectItem(item);
        }
        for(var i = 0; i < chests.length; i++) {
            if(chests[i] == this) {
                chests.splice(i,1);
                break;
            }
        }
    }
}