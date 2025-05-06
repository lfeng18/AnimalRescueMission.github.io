// 不再需要单独的Spider类，因为我们现在使用PathFollower
class Spider extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, x, y, texture) {
        super(scene, path, x, y, texture);
    }
}