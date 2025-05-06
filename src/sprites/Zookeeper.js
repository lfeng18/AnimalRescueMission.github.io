class Zookeeper extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'zookeeper');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 关键设置：定义碰撞体尺寸和物理属性
        this.body.setCollideWorldBounds(true);
        this.body.setSize(50, 80); // 根据图片大小调整
        this.body.setOffset(15, 10); // 可选：调整碰撞体偏移
    }

    update(cursors) {
        if (this.scene.isSlowed) return;

        if (cursors.left.isDown) {
            this.setVelocityX(-200);
        } else if (cursors.right.isDown) {
            this.setVelocityX(200);
        } else {
            this.setVelocityX(0);
        }
    }
}