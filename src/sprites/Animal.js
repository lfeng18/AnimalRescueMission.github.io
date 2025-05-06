class Animal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setScale(0.3);
        this.isTranquilized = false;
        this.directionChangeTimer = null; // 存储定时器引用
        
        // 物理设置
        this.setCollideWorldBounds(true);
        this.setBounce(0.5);
        this.body.onWorldBounds = true;
        
        // 初始速度
        this.setVelocity(
            Phaser.Math.Between(-100, 100),
            Phaser.Math.Between(50, 150)
        );
        
        // 边界碰撞回调
        this.body.world.on('worldbounds', (body) => {
            if (body.gameObject === this && !this.isTranquilized) {
                this.changeDirection();
            }
        });
        
        // 随机改变方向
        this.scheduleDirectionChange(scene);
    }

    scheduleDirectionChange(scene) {
        // 清除之前的定时器（防止重复）
        if (this.directionChangeTimer) {
            scene.time.removeEvent(this.directionChangeTimer);
        }
        
        this.directionChangeTimer = scene.time.delayedCall(
            Phaser.Math.Between(1000, 3000),
            () => {
                if (this.active && !this.isTranquilized) {
                    this.changeDirection();
                    this.scheduleDirectionChange(scene);
                }
            }
        );
    }

    changeDirection() {
        const newVelX = Phaser.Math.Between(-100, 100);
        const newVelY = Phaser.Math.Between(-100, 100);
        this.setVelocity(
            Math.sign(newVelX) * Math.max(50, Math.abs(newVelX)),
            Math.sign(newVelY) * Math.max(50, Math.abs(newVelY))
        );
    }

    tranquilize() {
        if (this.isTranquilized) return;
        
        this.isTranquilized = true;
        this.setTint(0x00ff00);
        this.setVelocity(0, 0);
        
        // 禁用物理和碰撞
        this.body.enable = false;
        
        // 清除所有待处理的定时器
        if (this.directionChangeTimer) {
            this.scene.time.removeEvent(this.directionChangeTimer);
            this.directionChangeTimer = null;
        }
    }

    // 不再需要 moveToEdge 方法
}