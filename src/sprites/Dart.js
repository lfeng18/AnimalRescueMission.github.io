class Dart extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dart');
             
        // 添加到场景和物理系统
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        
        // 物理设置
        this.setVelocityY(-300); // 固定向上速度
        this.setCollideWorldBounds(false);
        
        this.setScale(0.5);
        // 自动销毁设置
        this.body.onWorldBounds = true;
        this.body.world.on('worldbounds', (body) => {
            if (body.gameObject === this) {
                console.log("Dart exited screen, destroying");
                this.destroy();
            }
        });
    }

    update() {
    }
}