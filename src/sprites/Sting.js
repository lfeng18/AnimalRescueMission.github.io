class Sting extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'sting');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        
        this.setScale(0.5);
        this.setVelocityY(200); // 确保向下移动
        this.body.setAllowGravity(false);
        this.body.setCollideWorldBounds(false);
    }
}